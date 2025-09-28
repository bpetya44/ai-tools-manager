# AI Tools Manager

A portfolio-ready full-stack web app for managing AI tools.  
Built with **Next.js 15** (React 19, Tailwind CSS) and **Laravel 12** (PHP 8.2), powered by **MySQL + Redis** in Docker.  
Implements secure **authentication (Bearer tokens with Sanctum)**, **role-based access control (Admin/Manager/User)**, and full **CRUD for tools**.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) and **npm** (9+) - for local development
- **Git** - for cloning the repository
- **PHP** (8.2+) and **Composer** - for local Laravel development (optional)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB available
- **Ports**: 8200-8205 must be available

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd full-stack-starter-kit
```

### 2. Environment Setup

```bash
# Copy environment templates
cp backend/env.template backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env and set your configuration
# Edit frontend/.env.local and set API_URL=http://localhost:8201/api
```

### 3. Start with Docker

```bash
# Start all services
docker-compose up -d

# Run database migrations and seed
docker-compose exec php_fpm php artisan migrate --seed
```

### 4. Verify Installation

```bash
# Check all services are running
docker-compose ps

# Test API health
curl http://localhost:8201/api/health

# Test frontend
curl http://localhost:8200
```

🚀 **Demo Ready**

- **Frontend**: Next.js app (http://localhost:8200)
- **Backend API**: Laravel API (http://localhost:8201/api)
- **Health**: http://localhost:8201/api/health
- **Admin Panel**: http://localhost:8200/admin (2FA required)

## 🚀 Quick Start

### **1. Start the Application**

```bash
# Start all services
docker-compose up -d

# Run database migrations and seed
docker-compose exec php_fpm php artisan migrate --seed
```

### **2. Access the Application**

- **Login**: http://localhost:8200/login
- **Admin Panel**: http://localhost:8200/admin
- **API Health**: http://localhost:8201/api/health

### **3. Admin Login (2FA Enabled)**

- **Email**: `admin@example.com`
- **Password**: `Password123!`
- **2FA Code**: Generate with command below or use Google Authenticator

```bash
# Generate current 2FA code
docker-compose exec php_fpm php artisan tinker --execute="use PragmaRX\Google2FA\Google2FA; \$google2fa = new Google2FA(); \$secret = 'JBSWY3DPEHPK3PXP'; \$code = \$google2fa->getCurrentOtp(\$secret); echo '2FA code: ' . \$code;"
```

👤 **Seed Users**

- **Admin** → `admin@example.com` / `Password123!` (2FA enabled)
- **Manager** → `manager@example.com` / `Password123!`
- **User** → `user@example.com` / `Password123!`

## 👥 Role System & Permissions

The system implements a comprehensive role-based access control (RBAC) system:

| Role        | Dashboard    | Tools (CRUD)     | Admin Panel  | 2FA         | User Management | Audit Logs   | Tool Approval |
| ----------- | ------------ | ---------------- | ------------ | ----------- | --------------- | ------------ | ------------- |
| **Admin**   | ✅ Full      | ✅ Full          | ✅ Full      | ✅ Required | ✅ Full         | ✅ Full      | ✅ Full       |
| **Manager** | ✅ Full      | ✅ Create/Update | ❌ No Access | ⚠️ Optional | ❌ No Access    | ❌ No Access | ❌ No Access  |
| **User**    | ✅ View Only | ✅ View Only     | ❌ No Access | ⚠️ Optional | ❌ No Access    | ❌ No Access | ❌ No Access  |

### Permission Details

**Admin Role:**

- Full access to all features
- Can change user roles and activate/deactivate accounts
- Can approve/reject tool submissions
- Access to audit logs and system statistics
- 2FA is mandatory for security

**Manager Role:**

- Can create and update tools
- Cannot delete tools or access admin features
- 2FA is optional but recommended

**User Role:**

- Read-only access to tools and dashboard
- Cannot create, edit, or delete tools
- 2FA is optional

## 🔐 Admin Login with 2FA

The admin user has **Two-Factor Authentication (2FA) enabled** for enhanced security.

### **Quick Login Steps**

1. **Go to**: http://localhost:8200/login
2. **Enter credentials**: `admin@example.com` / `Password123!`
3. **Click "Sign in"** - 2FA code field will appear
4. **Enter 2FA code** (see options below)
5. **Click "Verify Code"**
6. **Access admin panel** at http://localhost:8200/admin

### **Getting Your 2FA Code**

#### **Option A: Use Google Authenticator (Recommended)**

1. Install **Google Authenticator** on your phone
2. Add new account with **setup key**: `JBSWY3DPEHPK3PXP`
3. Use the 6-digit code from the app

#### **Option B: Generate Test Code (Development)**

For development/testing, you can generate a test code:

```bash
# Get current 2FA code
docker-compose exec php_fpm php artisan tinker --execute="use PragmaRX\Google2FA\Google2FA; \$google2fa = new Google2FA(); \$secret = 'JBSWY3DPEHPK3PXP'; \$code = \$google2fa->getCurrentOtp(\$secret); echo '2FA code: ' . \$code;"
```

**Current 2FA Code**: `506830` (valid for 30 seconds)

> ⚠️ **Note**: 2FA codes change every 30 seconds. If the code doesn't work, generate a fresh one using the command above.

### **Admin Panel Features**

Once logged in, you can access:

- **📊 Dashboard**: http://localhost:8200/admin/dashboard

  - System statistics and user counts
  - Tool approval overview
  - Recent activity feed

- **👥 User Management**: http://localhost:8200/admin/users

  - Change user roles (Admin/Manager/User)
  - Activate/deactivate accounts
  - View user activity

- **🔧 Tool Management**: http://localhost:8200/admin/tools

  - Approve/reject tool submissions
  - Filter by status (pending/approved/rejected)
  - View submission details

- **📝 Audit Logs**: http://localhost:8200/admin/audit-logs
  - Track all system activities
  - Filter by action, user, date range
  - Security monitoring

### **2FA Troubleshooting**

If you're having trouble with 2FA:

1. **Code expired**: Generate a fresh code (expires every 30 seconds)
2. **Wrong code**: Make sure you're using the current code
3. **Clock sync**: Ensure your device clock is accurate
4. **Reset 2FA**: Contact system administrator to reset 2FA for admin user

### **Security Notes**

- 2FA is **mandatory** for admin users
- Codes are **time-based** (30-second windows)
- **Recovery codes** are available in user settings
- All admin actions are **audit logged**

⚡ **Features**

- JWT-style bearer token authentication with Laravel Sanctum
- **Two-Factor Authentication (2FA)** with TOTP, Email OTP, and recovery codes
- **Role-based access control (RBAC)** with Admin/Manager/User roles and middleware
- **Complete Tools Management System** with full CRUD operations and approval workflow
- **Comments & Ratings System** with 1-5 star ratings and user comments
- **Admin Panel** for user management, tool approval, and system monitoring
- **Redis Caching** for categories, tool counts, and tool details with automatic invalidation
- **Audit Logging** for all user actions and system changes with IP tracking
- **Rate Limiting** on authentication and sensitive endpoints
- **Password Reset** and email verification flows
- **Tool Approval Workflow** with status management (pending/approved/rejected)
- Search and filter tools by name, category, and status
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

## 🔐 Two-Factor Authentication (2FA)

The system supports multiple 2FA methods:

### **TOTP (Google Authenticator)**

- Enable via Settings → 2FA → Authenticator App
- Generates QR code for easy setup
- 8 recovery codes provided (save them safely!)

### **Email OTP (Development)**

- Perfect for development and testing
- Codes are logged to Laravel logs in dev environment
- 10-minute expiry with automatic cleanup
- Use `MAIL_MAILER=log` in `.env` for development

### **Environment Configuration**

```env
# 2FA Settings
MAIL_MAILER=log  # Use 'log' for development, 'smtp' for production
TELEGRAM_2FA_ENABLED=false  # Set to true to enable Telegram OTP
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
```

## 🚀 Redis Caching

The system uses Redis for intelligent caching:

- **Categories**: Cached for 10 minutes with automatic invalidation
- **Tool Counts**: Cached for 2 minutes by status and category
- **Dashboard Stats**: Cached for 2 minutes with real-time updates
- **Cache Control**: Toggle with `CACHE_ENABLED=true/false`

Cache is automatically invalidated when:

- Tools are created, updated, deleted, approved, or rejected
- Categories are modified
- User roles or status change

## 👑 Admin Panel

Access the admin panel at `/admin` (Admin role required):

### **User Management**

- List and search users with pagination
- Change user roles (Admin only)
- Activate/deactivate user accounts
- View user 2FA status and activity

### **Tool Approval Workflow**

- **Pending Tools**: New tools created by Users/Managers
- **Approved Tools**: Tools approved by Admins (visible to all)
- **Rejected Tools**: Tools rejected by Admins (archived)

### **Audit Logs**

- View all system actions with timestamps and IP addresses
- Filter by user, action type, model, and date range
- Track 2FA enable/disable, role changes, tool modifications

### **Dashboard Statistics**

- Total and active users
- Users with 2FA enabled
- Tool counts by status and category
- Recent login activity and audit entries

## 🔧 Tool Approval Workflow

The system implements a comprehensive approval workflow:

1. **Users/Managers** create tools (status: `pending`)
2. **Admins** can approve or reject tools
3. **Approved tools** become visible to all users
4. **Rejected tools** are archived but kept for audit purposes
5. **All actions** are logged with timestamps and user information

### **API Endpoints**

- `POST /api/tools/{id}/approve` - Approve a tool (Admin only)
- `POST /api/tools/{id}/reject` - Reject a tool (Admin only)
- `GET /api/tools?status=pending` - Get pending tools
- `GET /api/admin/audit-logs` - View audit logs (Admin only)

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

## ⭐ Comments & Ratings System

### Features

The system includes a comprehensive comments and ratings system for tools:

- **1-5 Star Ratings**: Users can rate tools with a 5-star system
- **User Comments**: Text comments (1-1000 characters) on tools
- **Average Rating Display**: Shows average rating and count on tool lists and details
- **Role-Based Permissions**: Users can delete their own comments, Admins/Managers can delete any
- **Real-time Updates**: Ratings and comments update immediately in the UI
- **Caching**: Tool details are cached with automatic invalidation on rating/comment changes

### How It Works

**Rating a Tool:**

1. Navigate to any tool detail page (`/tools/{id}`)
2. Click on the star rating (1-5 stars) in the sidebar
3. Your rating is immediately saved and the average updates
4. You can change your rating at any time

**Adding Comments:**

1. On the tool detail page, scroll to the comments section
2. Type your comment (1-1000 characters) in the textarea
3. Click "Add Comment" to submit
4. Your comment appears immediately in the list

**Managing Comments:**

- **Your Comments**: You can delete your own comments
- **Admin/Manager**: Can delete any comment for moderation
- **Comments List**: Shows latest 10 comments with author name and date

### Database Schema

**Comments Table** (`comments`):

- `id` (Primary Key)
- `tool_id` (Foreign Key to tools_tools)
- `user_id` (Foreign Key to users)
- `body` (Text, 1-1000 characters)
- `created_at`, `updated_at`

**Ratings Table** (`ratings`):

- `id` (Primary Key)
- `tool_id` (Foreign Key to tools_tools)
- `user_id` (Foreign Key to users)
- `score` (TinyInt, 1-5)
- `created_at`, `updated_at`
- Unique constraint on `(tool_id, user_id)` - one rating per user per tool

### API Endpoints

**Comments:**

- `POST /api/tools/{id}/comments` - Create a comment (any authenticated user)
- `DELETE /api/comments/{id}` - Delete a comment (own comment or Admin/Manager)

**Ratings:**

- `POST /api/tools/{id}/rating` - Create or update a rating (any authenticated user)

**Tool Details:**

- `GET /api/tools/{id}` - Returns tool with average rating, ratings count, and latest 10 comments

### Frontend Features

**Tool Detail Page** (`/tools/[id]`):

- Interactive star rating component
- Comment form with character counter
- Comments list with delete buttons (role-based)
- Average rating display with star visualization
- Real-time updates after rating/comment actions

**Tools List Page** (`/tools`):

- Shows average rating as stars next to each tool
- Displays ratings count
- Clickable tool names that link to detail page
- "Visit Tool" button for external links

### Caching Strategy

- **Tool Details**: Cached for 90 seconds with key `tool:show:{id}`
- **Cache Invalidation**: Automatically invalidated when:
  - New comment is added
  - Comment is deleted
  - Rating is created or updated
- **Performance**: Reduces database queries for frequently accessed tool details

### How to Add Tools via UI

**For Admin/Manager Users:**

1. **Navigate to Tools**: Go to http://localhost:8200/tools
2. **Click "Add New Tool"**: Green button in the top-right corner
3. **Fill the Form**:
   - **Name**: Tool name (required, max 120 characters)
   - **URL**: Tool website URL (required, must be valid URL)
   - **Description**: Brief description (optional, max 500 characters)
   - **Category**: Select from dropdown (Analytics, Marketing, Security)
4. **Submit**: Click "Create Tool" button
5. **Confirmation**: Tool will appear in the list immediately

**Tool Approval Workflow:**

- **User/Manager**: Tools created with "pending" status
- **Admin**: Must approve tools to make them visible to all users
- **Approval**: Go to Admin Panel → Tools → Approve/Reject

### How to Add Tools via API

```bash
# Get authentication token first
TOKEN=$(curl -X POST http://localhost:8201/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}' \
  -s | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Create a new tool
curl -X POST http://localhost:8201/api/tools \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub Copilot",
    "url": "https://github.com/features/copilot",
    "description": "AI-powered code completion and chat",
    "category_id": 3
  }'
```

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

### Security Features Test

```bash
# Run comprehensive security test
node scripts/test-security.mjs

# This tests:
# - 2FA setup and verification
# - Admin panel functionality
# - Rate limiting
# - Audit logging
# - Password reset flow
# - API endpoints
```

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

## 🔐 Security Features

### Two-Factor Authentication (2FA)

- **TOTP Support**: Compatible with Google Authenticator, Authy, and similar apps
- **Recovery Codes**: 8 single-use codes for account recovery
- **Enable/Disable**: Users can manage 2FA from their settings
- **QR Code Setup**: Easy setup with visual QR codes
- **Manual Entry**: Alternative setup with secret keys

### Admin Panel

- **User Management**: View, search, and filter all users
- **Role Management**: Change user roles (Admin only)
- **Account Status**: Activate/deactivate user accounts
- **Dashboard Stats**: System overview and user statistics
- **Audit Logs**: View all system activities and changes

### Audit Logging

- **Comprehensive Tracking**: All CRUD operations on tools and users
- **User Actions**: Login, logout, 2FA setup, password changes
- **IP Tracking**: Record IP addresses for security monitoring
- **Detailed Payloads**: Store old/new values for change tracking
- **Searchable Logs**: Filter by user, action, date range, model type

### Rate Limiting

- **Authentication**: 5 attempts per minute for login/register
- **Password Reset**: 3 attempts per minute for reset requests
- **Tool Operations**: 10 attempts per minute for create/update
- **Admin Actions**: 5 attempts per minute for delete operations
- **Email Verification**: 3 attempts per minute for resend requests

### Password Security

- **Reset Flow**: Secure password reset with time-limited tokens
- **Email Verification**: Required for new accounts
- **Token Expiration**: 1-hour expiry for reset tokens
- **Secure Storage**: Passwords hashed with Laravel's built-in hashing

### API Security

- **Bearer Token Auth**: Maintained throughout all new features
- **CORS Protection**: Properly configured for frontend-backend communication
- **Input Validation**: Server-side validation for all endpoints
- **Error Handling**: Standardized error responses without information leakage

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

## 🚀 Deployment

### Production Deployment

For production deployment, follow these steps:

#### 1. Environment Configuration

```bash
# Backend production .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (use managed service in production)
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your_production_db
DB_USERNAME=your_db_user
DB_PASSWORD=strong_password

# Redis (use managed service)
REDIS_HOST=your-redis-host
REDIS_PASSWORD=strong_redis_password

# Mail (configure SMTP)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
```

#### 2. Frontend Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Or using Docker
docker build -t your-app-frontend ./frontend
```

#### 3. Backend Production Setup

```bash
# Generate application key
docker-compose exec php_fpm php artisan key:generate

# Optimize for production
docker-compose exec php_fpm php artisan config:cache
docker-compose exec php_fpm php artisan route:cache
docker-compose exec php_fpm php artisan view:cache

# Run migrations
docker-compose exec php_fpm php artisan migrate --force
```

#### 4. Security Considerations

- Change all default passwords
- Use HTTPS in production
- Configure proper CORS origins
- Enable Redis AUTH
- Use strong database credentials
- Set up SSL certificates
- Configure firewall rules

#### 5. Monitoring & Logs

```bash
# View production logs
docker-compose logs -f

# Monitor resource usage
docker stats

# Health checks
curl https://yourdomain.com/api/health
```

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

## 📚 Documentation

### AI Agent Integration

This project is designed to work seamlessly with AI coding assistants:

- **[AI Agents Guide](./docs/agents.md)** - How to use Cursor and Claude Code CLI effectively
- **[Starter Prompts](./docs/prompts.md)** - Copy-paste ready prompts for common tasks

### Additional Resources

- **[API Documentation](./backend/README.md)** - Backend API reference
- **[Frontend Guide](./frontend/README.md)** - Frontend development guide
- **[Testing Guide](./docs/testing.md)** - Comprehensive testing documentation

### Quick Reference

- **Health Check**: `curl http://localhost:8201/api/health`
- **Admin Panel**: http://localhost:8200/admin (requires Admin role + 2FA)
- **API Base**: http://localhost:8201/api
- **Database**: MySQL on port 8203
- **Cache**: Redis on port 8204

---

**Generated with create-fullstack-env.sh**  
**Project ID**: vibecode-full-stack-starter-kit  
**Created**: Thu Sep 4 01:37:12 PM EEST 2025
