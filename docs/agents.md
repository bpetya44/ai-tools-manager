# AI Agents Integration Guide

This guide explains how to effectively use AI coding assistants (Cursor, Claude Code CLI) with this full-stack project.

## 🎯 Overview

This project is designed to work seamlessly with AI agents, providing clear structure, comprehensive documentation, and well-defined patterns that make AI assistance highly effective.

## 🚀 Getting Started

### Prerequisites

- **Cursor IDE** (recommended) or **Claude Code CLI**
- Understanding of the project structure
- Access to the project repository

### Quick Start

1. **Open the project** in your AI-enabled IDE
2. **Read the main README** to understand the tech stack
3. **Use the starter prompts** from `docs/prompts.md`
4. **Follow the established patterns** in the codebase

## 🔄 Typical AI Agent Workflows

### 1. Repository Audit

**When to use**: Starting work on the project or understanding existing code

```bash
# Use this prompt to get a comprehensive overview
"Please audit this full-stack project and provide:
1. Tech stack summary
2. Current feature status
3. Code quality assessment
4. Potential improvements
5. Security considerations"
```

### 2. Feature Development (Plan → Diffs → Implementation)

**When to use**: Adding new features or modifying existing ones

```bash
# Step 1: Planning
"Plan the implementation of [FEATURE_NAME] for this Laravel + Next.js project.
Include: database changes, API endpoints, frontend components, tests, and migration strategy."

# Step 2: Show diffs before applying
"Show me the exact file diffs for implementing [FEATURE_NAME].
Include all files that need to be created or modified."

# Step 3: Implementation
"Apply the planned changes for [FEATURE_NAME] with the approved diffs."
```

### 3. RBAC Implementation

**When to use**: Adding role-based access control features

```bash
"Implement RBAC for [RESOURCE_NAME] with these roles:
- Admin: full access
- Manager: read/write access
- User: read-only access

Include: middleware, policies, frontend guards, and tests."
```

### 4. CRUD Operations

**When to use**: Creating standard CRUD functionality

```bash
"Create a complete CRUD system for [MODEL_NAME] with:
- Laravel model, migration, controller, requests, resources
- Next.js pages (list, create, edit, view)
- Form validation (client + server)
- API tests and E2E tests"
```

### 5. UI Polish & Styling

**When to use**: Improving user interface and experience

```bash
"Polish the UI for [COMPONENT/PAGE] with:
- Consistent Tailwind CSS styling
- Loading states and error handling
- Responsive design
- Accessibility improvements (WCAG AA)
- Dark mode support"
```

### 6. Caching Implementation

**When to use**: Adding Redis caching for performance

```bash
"Implement Redis caching for [FEATURE] with:
- Cache service class
- Cache invalidation strategy
- Frontend cache integration
- Cache warming on deployment"
```

### 7. 2FA Integration

**When to use**: Adding two-factor authentication

```bash
"Add 2FA support for [FEATURE] with:
- TOTP setup and verification
- Recovery codes
- Email OTP fallback
- Admin enforcement
- Frontend UI components"
```

### 8. Admin Panel Features

**When to use**: Building administrative interfaces

```bash
"Create an admin panel for [RESOURCE] with:
- Data tables with search/filter/pagination
- Bulk actions
- Export functionality
- Audit logging
- Role-based access control"
```

### 9. CI/CD Pipeline

**When to use**: Setting up automated deployment

```bash
"Set up CI/CD pipeline with:
- GitHub Actions workflows
- Automated testing (PHPUnit, Vitest, Playwright)
- Docker builds
- Staging deployment
- Production deployment with rollback"
```

### 10. Documentation Updates

**When to use**: Keeping documentation current

```bash
"Update documentation for [FEATURE] including:
- README.md updates
- API documentation
- Code comments
- Architecture diagrams
- Deployment guides"
```

## 🛡️ AI Agent Guardrails

### Folder Scope Limits

**Always specify scope** to avoid unintended changes:

```bash
# Good: Specific scope
"Modify only files in backend/app/Http/Controllers/"

# Good: Exclude sensitive areas
"Update frontend components but avoid backend/.env files"

# Bad: Too broad
"Update the entire project"
```

### Show Plan First

**Always request a plan** before implementation:

```bash
# Good: Plan first approach
"Plan the implementation of user profiles with database schema, API endpoints, and frontend pages"

# Then: Review and approve
"Show me the exact diffs for the user profiles feature"

# Finally: Implement
"Apply the approved changes"
```

### Acceptance Criteria

**Define clear success criteria**:

```bash
"Implement [FEATURE] with these acceptance criteria:
1. All tests pass (PHPUnit, Vitest, Playwright)
2. No console errors in browser
3. Responsive design works on mobile
4. Admin can manage the feature
5. Audit logs are created for all actions"
```

## 🐛 Debugging Tips

### Network Errors (401/422/CORS)

```bash
# Debug authentication issues
"Debug the 401 Unauthorized error in [ENDPOINT].
Check: token handling, middleware, CORS config, and frontend auth state."

# Debug validation errors
"Debug the 422 validation error in [FORM].
Check: request validation rules, frontend form data, and error handling."
```

### Temporal Dead Zone (TDZ) Issues

```bash
# Fix hook dependency issues
"Fix the 'Cannot access before initialization' error in [COMPONENT].
Check: useEffect dependencies, useState initialization, and component lifecycle."
```

### Database Issues

```bash
# Debug migration problems
"Debug the migration error: [ERROR_MESSAGE].
Check: migration syntax, foreign key constraints, and data integrity."
```

## 📋 Best Practices

### 1. Incremental Changes

- Make small, focused changes
- Test each change before proceeding
- Use feature branches for larger changes

### 2. Consistent Patterns

- Follow existing code patterns
- Use established naming conventions
- Maintain consistent file structure

### 3. Security First

- Always validate inputs
- Use proper authentication
- Follow security best practices

### 4. Test Coverage

- Write tests for new features
- Update tests for modified features
- Ensure all tests pass

### 5. Documentation

- Update README for new features
- Add code comments for complex logic
- Document API changes

## 🔧 Common Commands

### Laravel Commands

```bash
# Create new feature
docker-compose exec php_fpm php artisan make:model ModelName -mcr
docker-compose exec php_fpm php artisan make:controller ModelController --resource
docker-compose exec php_fpm php artisan make:request StoreModelRequest

# Database operations
docker-compose exec php_fpm php artisan migrate
docker-compose exec php_fpm php artisan migrate:rollback
docker-compose exec php_fpm php artisan db:seed

# Testing
docker-compose exec php_fpm php artisan test
docker-compose exec php_fpm php artisan test --filter=ModelTest
```

### Frontend Commands

```bash
# Install packages
docker-compose exec frontend npm install package-name

# Run tests
docker-compose exec frontend npm run test
docker-compose exec frontend npx playwright test

# Build for production
docker-compose exec frontend npm run build
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Clean rebuild
docker-compose down -v && docker-compose up -d --build
```

## 🎯 Success Metrics

### Code Quality

- ✅ All tests pass
- ✅ No linting errors
- ✅ Consistent code style
- ✅ Proper error handling

### User Experience

- ✅ Responsive design
- ✅ Loading states
- ✅ Error messages
- ✅ Accessibility compliance

### Security

- ✅ Input validation
- ✅ Authentication required
- ✅ Role-based access
- ✅ Audit logging

### Performance

- ✅ Database queries optimized
- ✅ Caching implemented
- ✅ Bundle size reasonable
- ✅ Page load times acceptable

## 🚨 Troubleshooting

### Common Issues

1. **"Route not found"** - Check route definitions and middleware
2. **"Token expired"** - Refresh authentication token
3. **"CORS error"** - Verify CORS configuration
4. **"Database connection failed"** - Check Docker services
5. **"Build failed"** - Check Node.js and PHP versions

### Getting Help

1. **Check logs**: `docker-compose logs -f [service]`
2. **Verify environment**: `node scripts/dev-check.mjs`
3. **Run tests**: Ensure all tests pass
4. **Check documentation**: Review README and this guide

---

This guide is designed to make AI agent collaboration as smooth and effective as possible. Follow these patterns and you'll be able to rapidly develop features while maintaining code quality and security.
