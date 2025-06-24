-- SQL for creating job_portal database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('seeker', 'employer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) NULL,
    reset_token_expires TIMESTAMP NULL
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'internship') NOT NULL,
    salary VARCHAR(100),
    company_id INT,
    employer_id INT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
);

-- Insert sample data
INSERT INTO companies (name, description, website) VALUES
('TechCorp', 'Leading technology company specializing in software development', 'https://techcorp.com'),
('InnovateSoft', 'Innovative software solutions for modern businesses', 'https://innovatesoft.com'),
('DataFlow Systems', 'Data analytics and business intelligence solutions', 'https://dataflow.com'),
('CloudTech Solutions', 'Cloud infrastructure and DevOps services', 'https://cloudtech.com'),
('MobileFirst Apps', 'Mobile application development company', 'https://mobilefirst.com');

-- Insert sample jobs (assuming user with id=1 exists as employer)
INSERT INTO jobs (title, description, location, job_type, salary, company_id, employer_id) VALUES
('Senior React Developer', 'We are looking for an experienced React developer to join our team. You will be responsible for building user interfaces and implementing new features.', 'New York, NY', 'full-time', '$80,000 - $120,000', 1, 1),
('Frontend Developer', 'Join our frontend team to create beautiful and responsive web applications using modern JavaScript frameworks.', 'San Francisco, CA', 'full-time', '$70,000 - $100,000', 2, 1),
('Data Scientist', 'Analyze complex data sets and develop machine learning models to drive business decisions.', 'Austin, TX', 'full-time', '$90,000 - $130,000', 3, 1),
('DevOps Engineer', 'Manage cloud infrastructure and implement CI/CD pipelines for our development teams.', 'Seattle, WA', 'contract', '$100,000 - $140,000', 4, 1),
('Mobile App Developer', 'Develop native and cross-platform mobile applications for iOS and Android.', 'Boston, MA', 'full-time', '$75,000 - $110,000', 5, 1);