#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Job Portal Application...\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: './job-portal-backend', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: './job-portal-frontend', stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Check if .env file exists in backend
const envPath = path.join(__dirname, 'job-portal-backend', '.env');
const envExamplePath = path.join(__dirname, 'job-portal-backend', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Creating environment configuration...');
  try {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Environment file created from template');
      console.log('⚠️  Please update the .env file with your database credentials');
    } else {
      console.log('⚠️  env.example file not found. Please create .env file manually');
    }
  } catch (error) {
    console.error('❌ Failed to create environment file');
  }
} else {
  console.log('✅ Environment file already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file in job-portal-backend with your database credentials');
console.log('2. Create a MySQL database named "job_portal"');
console.log('3. Import the database schema: mysql -u your_username -p job_portal < job-portal-backend/database.sql');
console.log('4. Start the backend: cd job-portal-backend && npm start');
console.log('5. Start the frontend: cd job-portal-frontend && npm start');
console.log('\n🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000'); 