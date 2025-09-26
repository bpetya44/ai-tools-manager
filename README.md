# AI Tools Manager

A portfolio-ready full-stack web app for managing AI tools.  
Built with **Next.js 15** (React 19, Tailwind CSS) and **Laravel 12** (PHP 8.2), powered by **MySQL + Redis** in Docker.  
Implements secure **authentication (Bearer tokens with Sanctum)**, **role-based access control (Admin/Manager/User)**, and full **CRUD for tools**.

🚀 **Demo Ready**

- **Frontend**: Next.js app (http://localhost:8200)
- **Backend API**: Laravel API (http://localhost:8201/api)
- **Health**: http://localhost:8201/api/health

👤 **Seed Users**

- Admin → `admin@example.com` / `Password123!`
- Manager → `manager@example.com` / `Password123!`
- User → `user@example.com` / `Password123!`

⚡ **Features**

- JWT-style bearer token authentication with Laravel Sanctum
- Role-based access control (RBAC) with Admin/Manager/User roles
- **Complete Tools Management System** with full CRUD operations
- Search and filter tools by name and category
- Form validation (client-side and server-side)
- Standardized JSON API responses with error handling
- Dockerized MySQL + Redis for easy local dev
- Comprehensive test suite (PHPUnit, Vitest, Playwright)
- Beginner-friendly README and scripts for quick setup

🛠️ **Tech Stack**

- **Frontend**: Next.js + React + TypeScript (Port 8200)
- **Backend**: Laravel + PHP 8.2 + Nginx (Port 8201)
- **Database**: MySQL 8.0 (Port 8203)
- **Cache**: Redis 7 (Port 8204)
- **Development Tools**: Alpine container (Port 8205)

## 📋 Quick Start

1. **Start the environment:**

   ```bash
   ./start.sh
   ```

2. **Access your applications:**

   - Frontend: http://localhost:8200
   - Backend: http://localhost:8201
   - API Status: http://localhost:8201/api/status

3. **Stop the environment:**
   ```bash
   ./stop.sh
   ```

## 🛠️ Tools Management System

### Overview

The application includes a complete tools management system with role-based access control:

- **Admin**: Full CRUD access (Create, Read, Update, Delete)
- **Manager**: Create and Update access only
- **User**: Read-only access (view and search tools)

### Database Schema

**Tools Categories** (`tools_categories`):

- `id` (Primary Key)
- `name` (Unique)
- `created_at`, `updated_at`

**Tools** (`tools_tools`):

- `id` (Primary Key)
- `name` (Required, max 120 chars)
- `url` (Required, valid URL, max 255 chars)
- `description` (Optional, max 500 chars)
- `category_id` (Foreign Key to tools_categories)
- `created_by` (Foreign Key to users, optional)
- `created_at`, `updated_at`

### API Endpoints

All endpoints require Bearer token authentication:

#### Public Endpoints

- `GET /api/tools-categories` - List all categories

#### Authenticated Endpoints

- `GET /api/tools` - List tools (with search/filter support)
  - Query params: `q` (search), `category_id`, `page`, `per_page`
- `GET /api/tools/{id}` - Get single tool
- `POST /api/tools` - Create tool (Admin/Manager only)
- `PUT /api/tools/{id}` - Update tool (Admin/Manager only)
- `DELETE /api/tools/{id}` - Delete tool (Admin only)

#### Example API Usage

```bash
# Get authentication token
TOKEN=$(curl -X POST http://localhost:8201/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}' \
  -s | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# List tools
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8201/api/tools

# Create a tool
curl -X POST http://localhost:8201/api/tools \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Tool",
    "url": "https://example.com",
    "description": "A sample tool",
    "category_id": 1
  }'

# Search tools
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8201/api/tools?q=analytics&category_id=1"
```

### Frontend Features

- **Tools List Page** (`/tools`):

  - Search by tool name
  - Filter by category
  - Pagination support
  - Role-based action buttons

- **Add Tool Page** (`/tools/new`):

  - Form validation (client-side and server-side)
  - Real-time character counting
  - Error handling with inline messages

- **Edit Tool Page** (`/tools/{id}/edit`):
  - Pre-populated form with existing data
  - Partial updates (only changed fields are sent)
  - Same validation as add form
  - Real-time change detection

### Sample Data

The system comes pre-seeded with:

**Categories:**

- Analytics
- Marketing
- Security

**Tools (10 total):**

- **Analytics**: Google Analytics, Mixpanel, Hotjar
- **Marketing**: HubSpot, Mailchimp, Buffer, Canva
- **Security**: 1Password, Auth0, Cloudflare

## 🔧 Management Scripts

- `./start.sh` - Start all services with auto-setup
- `./stop.sh` - Stop all services
- `./laravel-setup.sh` - Full Laravel initialization
- `./db-manage.sh` - Database management utilities
- `node scripts/dev-check.mjs` - Check development environment health
- `node scripts/security-check.mjs` - Verify no secrets are committed

## 🧪 Testing

### Backend Tests (PHPUnit)

```bash
# Run all tests
docker compose exec php_fpm php artisan test

# Run specific test suite
docker compose exec php_fpm php artisan test --filter=ToolsToolTest

# Run with coverage
docker compose exec php_fpm php artisan test --coverage
```

### Frontend Tests (Vitest)

```bash
# Run all tests
cd frontend && npm run test

# Run tests once
cd frontend && npm run test:run

# Run with coverage
cd frontend && npm run test -- --coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
cd frontend && npx playwright test

# Run specific test file
cd frontend && npx playwright test tests/tools.spec.ts

# Run tests in headed mode (see browser)
cd frontend && npx playwright test --headed

# Generate test report
cd frontend && npx playwright test --reporter=html
```

### Test Coverage

- **Backend**: 12 tests covering all CRUD operations, RBAC, and validation
- **Frontend**: 4 tests covering API utility functions and form validation
- **E2E**: 4 test scenarios covering user workflows and role permissions

### Database Migrations & Seeding

```bash
# Run migrations and seed the database
docker compose exec php_fpm php artisan migrate --force && docker compose exec php_fpm php artisan db:seed

# Or run individually
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan db:seed
```

**Seeded Data:**

- 3 users (Admin, Manager, User) with password `Password123!`
- 3 categories (Analytics, Marketing, Security)
- 10 demo tools across all categories

## 📁 Project Structure

```
vibecode-full-stack-starter-kit/
├── frontend/             # Next.js application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── package.json     # Frontend dependencies
│   └── next.config.js   # Next.js configuration
├── backend/             # Laravel application
│   ├── app/             # Application code
│   ├── public/          # Web root
│   ├── routes/          # API routes
│   ├── database/        # Migrations, seeders
│   ├── .env            # Laravel configuration
│   └── composer.json    # Backend dependencies
├── nginx/              # Nginx configuration
├── docker/             # Docker configurations
├── mysql/init/         # Database initialization
├── tools/              # Development utilities
├── docker-compose.yml  # Container orchestration
└── README.md          # This documentation
```

## 🐳 Docker Services

All services are isolated with unique names: `vibecode-full-stack-starter-kit_*`

- **frontend** - Next.js development server
- **backend** - Nginx reverse proxy
- **php_fpm** - PHP-FPM for Laravel
- **mysql** - MySQL 8.0 database
- **redis** - Redis cache server
- **tools** - Development utilities container

## 💻 Development Commands

### Frontend Development

```bash
# Access frontend container
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install package-name

# View frontend logs
docker compose logs frontend -f
```

### Backend Development

```bash
# Access PHP container
docker compose exec php_fpm sh

# Laravel Artisan commands
docker compose exec php_fpm php artisan --version
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan make:controller UserController
docker compose exec php_fpm php artisan make:model Product -m

# Composer commands
docker compose exec php_fpm composer install
docker compose exec php_fpm composer require laravel/sanctum

# View backend logs
docker compose logs backend -f
docker compose logs php_fpm -f
```

### Database Operations

```bash
# Connect to MySQL
./db-manage.sh connect

# Create backup
./db-manage.sh backup

# Connect to Redis
./db-manage.sh redis

# Direct MySQL access
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app
```

## 🔐 Database Configuration

**MySQL Credentials:**

- Host: mysql (internal) / localhost:8203 (external)
- Database: vibecode-full-stack-starter-kit_app
- Username: root
- Password: vibecode-full-stack-starter-kit_mysql_pass

**Redis Configuration:**

- Host: redis (internal) / localhost:8204 (external)
- Password: vibecode-full-stack-starter-kit_redis_pass

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts:**

   - Check if ports 8200-8205 are available
   - Use `netstat -tulpn | grep :PORT` to check port usage

2. **Permission issues:**

   - Run `./laravel-setup.sh` to fix Laravel permissions

3. **Services not starting:**
   - Check Docker is running: `docker ps`
   - View logs: `docker compose logs`

### Useful Commands

```bash
# Check service status
docker compose ps

# View all logs
docker compose logs -f

# Restart specific service
docker compose restart frontend
docker compose restart backend

# Rebuild services
docker compose up -d --build

# Clean up (removes containers and volumes)
docker compose down -v
```

## 📊 Monitoring

- **Service Status**: `docker compose ps`
- **Resource Usage**: `docker stats`
- **Logs**: `docker compose logs -f [service_name]`

## 🔄 Updates

To update the environment:

1. Pull latest images: `docker compose pull`
2. Rebuild services: `docker compose up -d --build`

## ✅ Current Status

**Fully Working Features:**

- ✅ Authentication system (login/register with Bearer tokens)
- ✅ Role-based access control (Admin/Manager/User)
- ✅ Complete Tools Management System (CRUD operations)
- ✅ Search and filtering functionality
- ✅ Form validation (client-side and server-side)
- ✅ Partial updates for tool editing
- ✅ Real-time UI updates after changes
- ✅ Comprehensive test suite

**API Endpoints Status:**

- ✅ All endpoints standardized to `/api/tools/{id}` format
- ✅ Proper JSON request/response handling
- ✅ Validation and error handling working correctly
- ✅ Authentication and authorization working

## 🚨 Troubleshooting "Network Error"

If you're experiencing network errors between the frontend and backend:

### 1. Check Environment Health

```bash
node scripts/dev-check.mjs
```

### 1.1. Security Check

```bash
node scripts/security-check.mjs
```

### 2. Verify Services Are Running

```bash
docker compose ps
```

### 3. Check Backend Logs

```bash
docker compose logs php_fpm --tail=50
docker compose logs backend --tail=50
```

### 4. Test API Endpoints Directly

```bash
# Test health endpoint
curl http://localhost:8201/api/health

# Test login with seeded user
curl -X POST http://localhost:8201/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'
```

### 5. Frontend Environment Variables

Ensure `frontend/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8201/api
```

### 6. Common Issues & Solutions

**Issue**: "Trait Laravel\Sanctum\HasApiTokens not found"

- **Solution**: Laravel Sanctum is now installed automatically

**Issue**: "504 Gateway Timeout"

- **Solution**: Check if PHP-FPM container is healthy: `docker compose ps`

**Issue**: "CORS error"

- **Solution**: CORS is configured for `http://localhost:8200`

**Issue**: "Route not found"

- **Solution**: Clear route cache: `docker compose exec php_fpm php artisan route:clear`

### 7. Authentication Mode

This project uses **Bearer Token Authentication**:

- Login/Register endpoints return a personal access token
- Frontend stores token in localStorage
- All API requests include `Authorization: Bearer <token>` header
- No CSRF cookies needed

### 8. Demo Users

After seeding, you can use these accounts:

- **Admin**: `admin@example.com` / `Password123!`
- **Manager**: `manager@example.com` / `Password123!`
- **User**: `user@example.com` / `Password123!`

## 🔒 Security Checklist

### ✅ Secrets Protection

- [x] All `.env*` files are in `.gitignore`
- [x] Database passwords are excluded from version control
- [x] API keys and tokens are not hardcoded
- [x] Authentication secrets are properly configured
- [x] Laravel Sanctum tokens are handled securely

### ⚠️ Security Notes

- **Demo passwords** (`Password123!`) are for development only
- **Change all passwords** before production deployment
- **Rotate API keys** and secrets regularly
- **Use HTTPS** in production environments
- **Enable CORS** only for trusted domains

### 🛡️ Production Security

1. Generate strong passwords for all services
2. Use environment-specific `.env` files
3. Enable Laravel's security middleware
4. Configure proper CORS origins
5. Use database connection encryption
6. Enable Redis AUTH in production

---

**Generated with create-fullstack-env.sh**  
**Project ID**: vibecode-full-stack-starter-kit  
**Created**: Thu Sep 4 01:37:12 PM EEST 2025
