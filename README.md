# 🏥 Clinic Front Desk Management System

![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=next.js&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

A comprehensive, production-ready clinic management system built with **NestJS** (Backend) and **Next.js** (Frontend). This system provides complete front desk operations including patient management, appointment scheduling, queue management, doctor profiles, analytics, and advanced search capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [Support](#-support)

## ✨ Features

### 🏠 **Dashboard**

- Real-time clinic statistics and metrics
- Live queue status and appointment overview
- Quick access to all system functions
- Responsive design for all devices

### 👥 **Queue Management**

- Real-time patient queue with live updates
- Priority-based queue handling
- Queue status tracking (Waiting, In Progress, Completed)
- Estimated wait times and notifications

### 📅 **Appointment Scheduling**

- Full calendar-based appointment booking
- Doctor availability management
- Appointment status tracking
- Conflict detection and resolution

### 👤 **Patient Management**

- Complete patient records management
- Contact information and medical history
- Search and filter capabilities
- Patient registration and updates

### 👨‍⚕️ **Doctor Management**

- Doctor profile management
- Specialization tracking
- Availability scheduling
- Performance analytics

### 🔍 **Advanced Search**

- Multi-type search (Patients, Doctors, Appointments)
- Advanced filtering options
- Real-time search results
- Export capabilities

### 📊 **Analytics Dashboard**

- Comprehensive performance metrics
- Visual charts and graphs
- Doctor utilization tracking
- Queue performance analysis
- Exportable reports (PDF)

### 🔐 **Security Features**

- JWT-based authentication
- Role-based access control
- Rate limiting and request throttling
- CORS protection
- Input validation and sanitization

## 🛠 Technology Stack

### Backend

- **Framework**: NestJS 10.x with TypeScript
- **Database**: MySQL 8.0 with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Caching**: Redis for session management
- **Security**: Helmet, Rate Limiting, CORS

### Frontend

- **Framework**: Next.js 15.x with TypeScript
- **UI Library**: Tailwind CSS 4.x
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

### DevOps & Deployment

- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2
- **Monitoring**: Built-in health checks
- **SSL/TLS**: Let's Encrypt ready

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Nginx         │    │   NestJS        │
│   Frontend      │◄──►│   Reverse       │◄──►│   Backend API   │
│   (Port 3000)   │    │   Proxy         │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
┌─────────────────┐            │                ┌─────────────────┐
│   Static Files  │◄───────────┘                │   MySQL         │
│   & Uploads     │                             │   Database      │
└─────────────────┘                             │   (Port 3306)   │
                                                 └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │   Redis Cache   │
                                                 │   (Port 6379)   │
                                                 └─────────────────┘
```

## 📁 File Structure (High Level)

```
.
├── backend/                  # NestJS API (patients, doctors, queue, appointments, auth, analytics)
│   ├── src/
│   │   ├── auth/             # JWT auth & strategies
│   │   ├── patients/         # Patient entity + CRUD
│   │   ├── doctors/          # Doctor management
│   │   ├── appointments/     # Booking & scheduling logic
│   │   ├── queue/            # Real‑time queue handling
│   │   ├── analytics/        # Aggregated metrics service
│   │   ├── common/           # Guards, decorators, enums
│   │   └── config/           # TypeORM + global config
│   └── database/             # Seeds & migrations
├── frontend/                 # Next.js (App Router) UI
│   ├── src/app/              # Route segments
│   ├── src/components/       # Reusable UI modules
│   ├── src/lib/api.ts        # Axios client & API wrappers
│   └── tailwind.config.*
├── nginx/                    # Reverse proxy config (optional)
├── docker-compose.yml        # Multi-service orchestration
└── deploy.sh                 # Automation helper (production)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/your-org/clinic-management.git
cd clinic-management
```

2. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migration:run
npm run seed
npm run start:dev
```

3. **Setup Frontend**

```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

4. **Seed initial data (users + sample patients)**

```bash
docker exec clinic-backend node dist/database/seeds/seed.js
```

5. **Access the application**

- Frontend: http://localhost:3003
- Backend API: http://localhost:3002
- API Docs: http://localhost:3002/api-docs

### Docker Deployment

1. **Start with Docker Compose**

```bash
docker-compose up -d
```

2. **Run migrations**

```bash
docker exec clinic-backend npm run migration:run
docker exec clinic-backend npm run seed
```

3. **Access the application**

- Application: http://localhost:3003
- API: http://localhost:3002

## ⚙️ Configuration

### Backend Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=clinic_user
DB_PASS=your_secure_password
DB_NAME=clinic_db

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
CORS_ORIGIN=http://localhost:3003
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=Clinic Front Desk System
NEXT_PUBLIC_VERSION=1.0.0
```

## 🚀 Deployment

### Production Deployment Script

Use the provided deployment script for automated production deployment:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:

- Check system requirements
- Create automatic backups
- Build and deploy containers
- Run database migrations
- Perform health checks
- Display deployment status

### Manual Deployment Steps

1. **Build for production**

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

2. **Deploy with Docker**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Setup SSL (recommended)**

```bash
# Using Let's Encrypt
certbot --nginx -d your-domain.com
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger and available at:

- **Development**: http://localhost:3002/api-docs
- **Production**: https://your-domain.com/api-docs

### Key API Endpoints

```
Authentication:
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/refresh            - Refresh JWT token

Patients:
GET    /patients                - Get all patients
POST   /patients                - Create patient
GET    /patients/:id            - Get patient by ID
PATCH  /patients/:id            - Update patient
DELETE /patients/:id            - Delete patient

Doctors:
GET    /doctors                 - Get all doctors
POST   /doctors                 - Create doctor
GET    /doctors/:id             - Get doctor by ID
PATCH  /doctors/:id             - Update doctor
DELETE /doctors/:id             - Delete doctor

Appointments:
GET    /appointments            - Get all appointments
POST   /appointments            - Create appointment
GET    /appointments/:id        - Get appointment by ID
PATCH  /appointments/:id        - Update appointment
DELETE /appointments/:id        - Delete appointment

Queue:
GET    /queue                   - Get queue status
POST   /queue                   - Add to queue
PATCH  /queue/:id/status        - Update queue status
DELETE /queue/:id               - Remove from queue

Analytics:
GET    /analytics               - Get analytics data
GET    /analytics/export        - Export reports
```

## 🔒 Security

### Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation using class-validator
- **Rate Limiting**: API endpoint protection against abuse
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet.js for security headers
- **SQL Injection**: Protected via TypeORM parameterized queries
- **XSS Protection**: Input sanitization and output encoding

### Security Best Practices

- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS in production
- Regular security updates
- Database user with minimal privileges
- Environment variable protection
- Regular backup procedures

## ⚡ Performance

### Optimization Features

- **Caching**: Redis for session and data caching
- **Database**: Optimized queries with proper indexing
- **Frontend**: Next.js optimization with static generation
- **CDN**: Ready for CDN integration
- **Compression**: Gzip compression enabled
- **Connection Pooling**: Database connection optimization

### Performance Monitoring

- Health check endpoints
- Resource usage monitoring
- Response time tracking
- Error rate monitoring

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend tests
cd frontend
npm run test
npm run test:watch
```

### Test Coverage

- Unit tests for all services and controllers
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## 📖 User Guide

### Default Login Credentials

```
Email: admin@clinic.com
Password: admin123
```

**⚠️ Important**: Change default credentials immediately after first login.

### System Workflow

1. **Login** to the system
2. **Dashboard** provides system overview
3. **Queue Management** for daily operations
4. **Appointments** for scheduling
5. **Patient/Doctor Management** for records
6. **Analytics** for insights and reporting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@clinic-system.com

### System Requirements

- **Minimum**: 2GB RAM, 2 CPU cores, 10GB storage
- **Recommended**: 4GB RAM, 4 CPU cores, 50GB storage
- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **Node.js**: Version 18+ required

## 🎯 Roadmap

### Upcoming Features

- [ ] Mobile application (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Automated backup system
- [ ] Advanced role management
- [ ] Telemedicine integration
- [ ] Payment processing

### Version History

- **v1.0.0** - Initial production release
- **v0.9.0** - Beta release with all core features
- **v0.5.0** - Alpha release with basic functionality

---

**Made with ❤️ for healthcare providers worldwide**

_This system is designed to streamline clinic operations and improve patient care delivery._

---

## 🛰 Publishing to GitHub (Quick Guide)

1. Create a new empty repository on GitHub (do **not** add README / license there if you keep this one).
2. From project root (this directory):

```bash
# If repo not yet initialized
git init
git add .
git commit -m "chore: initial commit"

# Add origin (replace URL)
git remote add origin https://github.com/<your-username>/<your-repo>.git

# Push main branch
git branch -M main
git push -u origin main
```

3. (Optional) Add tags / releases:

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

4. Enable Issues & set Repo Description summarizing: "Clinic front desk management (NestJS + Next.js) with patients, doctors, appointments, queue & analytics".

### Recommended README Enhancements (Optional)

- Add screenshots (e.g., `docs/screens/`) and embed: `![Dashboard](docs/screens/dashboard.png)`
- Add a Demo section if you deploy (Render / Railway / AWS)
- Add a "Tech Decisions" section briefly explaining choices (NestJS for modular architecture, Redis for queue caching, etc.)
- Add CI badge (GitHub Actions) once you create a workflow (lint + build + test).

---

## 🧩 Badge Snippets (Copy/Paste)

```
![Build](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![React Query](https://img.shields.io/badge/React%20Query-%F0%9F%8C%80-FF4154)
```

Add them near the title after you create the workflow.
# Allo-Health
