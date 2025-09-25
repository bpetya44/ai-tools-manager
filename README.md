# vibecode-full-stack-starter-kit - Full-Stack Development Environment

Generated on: Thu Sep 4 01:37:12 PM EEST 2025
Location: /home/softart/scripts/vibecode-full-stack-starter-kit

## 🚀 Tech Stack

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

## 🔧 Management Scripts

- `./start.sh` - Start all services with auto-setup
- `./stop.sh` - Stop all services
- `./laravel-setup.sh` - Full Laravel initialization
- `./db-manage.sh` - Database management utilities
- `node scripts/dev-check.mjs` - Check development environment health

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

## 🚨 Troubleshooting "Network Error"

If you're experiencing network errors between the frontend and backend:

### 1. Check Environment Health

```bash
node scripts/dev-check.mjs
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

---

**Generated with create-fullstack-env.sh**  
**Project ID**: vibecode-full-stack-starter-kit  
**Created**: Thu Sep 4 01:37:12 PM EEST 2025
