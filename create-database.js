const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createDatabase() {
  console.log('🔧 Creating database and importing schema...');
  
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS job_portal');
    console.log('✅ Database "job_portal" created successfully');

    // Use the database
    await connection.execute('USE job_portal');
    console.log('✅ Using database "job_portal"');

    // Read and execute the SQL schema
    const sqlPath = path.join(__dirname, 'job-portal-backend', 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (err) {
          // Ignore errors for statements that might already exist
          if (!err.message.includes('already exists')) {
            console.log(`⚠️  Warning: ${err.message}`);
          }
        }
      }
    }

    console.log('Database schema imported successfully');
    console.log('Database setup completed!');

    await connection.end();
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

createDatabase(); 