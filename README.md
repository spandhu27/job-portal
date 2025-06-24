# Job Portal Application

A full-stack job portal application built with React.js frontend and Node.js/Express backend with MySQL database.

## Features

- **User Authentication**: Register and login with role-based access (job seekers and employers)
- **Job Listings**: Browse and search for jobs with filters
- **Job Applications**: Apply for jobs with resume URL and cover letter
- **Job Posting**: Employers can post new job listings
- **Password Reset**: Forgot password functionality
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- React.js 19.1.0
- React Router DOM 7.6.2
- Tailwind CSS 3.4.17
- React Icons 5.5.0
- React Hot Toast 2.5.2

### Backend
- Node.js
- Express.js 4.18.2
- MySQL2 3.6.0
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd job-portal
```

### 2. Backend Setup

```bash
cd job-portal-backend
npm install
```

#### Database Setup
1. Create a MySQL database named `job_portal`
2. Import the database schema:
```bash
mysql -u your_username -p job_portal < database.sql
```

#### Environment Configuration
1. Copy the environment example file:
```bash
cp env.example .env
```

2. Update the `.env` file with your database credentials:
```env
DB_HOST=127.0.0.1
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=job_portal
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

#### Start the backend server
```bash
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd job-portal-frontend
npm install
```

#### Start the frontend development server
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Jobs
- `GET /api/jobs` - Get all jobs (with optional search/filter)
- `GET /api/jobs/:jobId` - Get specific job details
- `POST /api/jobs` - Post new job (employers only)

### Applications
- `POST /api/apply` - Submit job application
- `GET /api/applications` - Get user's applications

### Companies
- `GET /api/companies` - Get all companies

## Database Schema

The application uses the following main tables:
- `users` - User accounts with roles
- `companies` - Company information
- `jobs` - Job listings
- `applications` - Job applications

## Usage

### For Job Seekers
1. Register with role "seeker"
2. Browse available jobs
3. Apply for jobs with resume URL and cover letter
4. Track application status

### For Employers
1. Register with role "employer"
2. Post new job listings
3. View applications for posted jobs
4. Manage job postings

## Project Structure

```
job-portal/
├── job-portal-backend/
│   ├── server.js          # Main server file
│   ├── database.sql       # Database schema
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
└── job-portal-frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── context/       # React context (AuthContext)
    │   └── App.js         # Main app component
    ├── package.json       # Frontend dependencies
    └── tailwind.config.js # Tailwind configuration
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env` file
   - Verify database `job_portal` exists

2. **CORS Errors**
   - Backend has CORS enabled for development
   - Frontend proxy is configured to `http://localhost:5000`

3. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration (24 hours by default)

4. **Port Conflicts**
   - Backend runs on port 5000
   - Frontend runs on port 3000
   - Update ports in `.env` if needed

## Development

### Adding New Features
1. Backend: Add new routes in `server.js`
2. Frontend: Create new components in `src/components/`
3. Update database schema if needed
4. Test API endpoints

### Code Style
- Use consistent formatting
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic

## License

This project is for educational purposes. Feel free to modify and use as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository. 