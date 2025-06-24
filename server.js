console.log('Current working directory:', process.cwd());
require('dotenv').config();
console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);
console.log('Loaded DB_HOST:', process.env.DB_HOST);
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Pool Setup
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Test MySQL connection
(async () => {
  try {
    const conn = await db.getConnection();
    console.log('MySQL pool connected!');
    conn.release();
  } catch (err) {
    console.error(' Failed to connect to MySQL pool:', err.message);
  }
})();

// Middleware: Token Verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(403).json({ message: 'A token is required' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized token' });
    req.user = decoded;
    next();
  });
};

const isEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'employer') return next();
  res.status(403).json({ message: 'Only employers allowed' });
};

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role)
    return res.status(400).json({ message: 'All fields required' });

  if (!['seeker', 'employer'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashed, role]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email & Password required' });

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error' });
  }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(404).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);

    console.log(`Reset link: http://localhost:3000/reset-password/${token}`);
    res.status(200).json({ message: 'Reset link generated', token }); // In real app: send by email
  } catch (err) {
    console.error("Forgot Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: 'Token and new password required' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (users.length === 0)
      return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashed, users[0].id]);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ message: 'Reset error' });
  }
});

// Fetch Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { q, location } = req.query;
    let sql = `SELECT j.id, j.title, j.location, j.job_type, j.salary, j.description, c.name AS company 
               FROM jobs j 
               LEFT JOIN companies c ON j.company_id = c.id 
               WHERE j.is_active = 1`;
    const params = [];

    if (q) {
      sql += ' AND (j.title LIKE ? OR c.name LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (location) {
      sql += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }

    sql += ' ORDER BY j.posted_at DESC';
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("Job Fetch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job by ID
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const sql = `SELECT j.*, c.name AS company, c.website AS company_website 
                 FROM jobs j 
                 LEFT JOIN companies c ON j.company_id = c.id 
                 WHERE j.id = ? AND j.is_active = 1`;
    
    const [results] = await db.query(sql, [jobId]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error("Job Detail Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit job application
app.post('/api/apply', verifyToken, async (req, res) => {
  const { jobId, fullName, email, resumeUrl, coverLetter } = req.body;
  
  if (!jobId || !fullName || !email) {
    return res.status(400).json({ message: 'Job ID, full name, and email are required' });
  }

  try {
    // Check if job exists and is active
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND is_active = 1', [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found or inactive' });
    }

    // Check if user already applied
    const [existingApps] = await db.query('SELECT * FROM applications WHERE job_id = ? AND user_id = ?', [jobId, req.user.id]);
    if (existingApps.length > 0) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    // Insert application
    await db.query(
      'INSERT INTO applications (job_id, user_id, full_name, email, resume_url, cover_letter) VALUES (?, ?, ?, ?, ?, ?)',
      [jobId, req.user.id, fullName, email, resumeUrl || null, coverLetter || null]
    );

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error("Application Error:", err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Post new job (employers only)
app.post('/api/jobs', verifyToken, isEmployer, async (req, res) => {
  const { title, description, location, jobType, salary, companyId } = req.body;
  
  if (!title || !description || !location || !jobType) {
    return res.status(400).json({ message: 'Title, description, location, and job type are required' });
  }

  if (!['full-time', 'part-time', 'contract', 'internship'].includes(jobType)) {
    return res.status(400).json({ message: 'Invalid job type' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, description, location, job_type, salary, company_id, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, jobType, salary || null, companyId || null, req.user.id]
    );

    res.status(201).json({ 
      message: 'Job posted successfully',
      jobId: result.insertId 
    });
  } catch (err) {
    console.error("Post Job Error:", err);
    res.status(500).json({ message: 'Failed to post job' });
  }
});

// Get user's applications
app.get('/api/applications', verifyToken, async (req, res) => {
  try {
    const sql = `SELECT a.*, j.title AS job_title, c.name AS company_name 
                 FROM applications a 
                 JOIN jobs j ON a.job_id = j.id 
                 LEFT JOIN companies c ON j.company_id = c.id 
                 WHERE a.user_id = ? 
                 ORDER BY a.applied_at DESC`;
    
    const [results] = await db.query(sql, [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error("Applications Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get companies for job posting
app.get('/api/companies', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, description FROM companies ORDER BY name');
    res.json(results);
  } catch (err) {
    console.error("Companies Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
