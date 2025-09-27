# AI Agent Starter Prompts

This collection provides copy-paste ready prompts for common development tasks with this full-stack project.

## 📋 How to Use

1. **Copy the prompt** that matches your task
2. **Replace placeholders** (like `[FEATURE_NAME]`) with your specific requirements
3. **Paste into your AI agent** (Cursor, Claude Code CLI, etc.)
4. **Review the plan** before implementation
5. **Apply changes** incrementally

---

## 🔍 Repository Audit

### Complete Project Audit

```
Please audit this full-stack project and provide:

1. **Tech Stack Summary**
   - Frontend: Next.js, React, TypeScript, Tailwind CSS
   - Backend: Laravel, PHP, MySQL, Redis
   - Infrastructure: Docker, Nginx

2. **Current Feature Status**
   - Authentication system (2FA, RBAC)
   - Tools management (CRUD, approval workflow)
   - Admin panel functionality
   - Testing coverage

3. **Code Quality Assessment**
   - Code organization and patterns
   - Error handling and validation
   - Security implementations
   - Performance optimizations

4. **Potential Improvements**
   - Missing features or enhancements
   - Code refactoring opportunities
   - Performance optimizations
   - Security hardening

5. **Security Considerations**
   - Authentication and authorization
   - Input validation and sanitization
   - Data protection and privacy
   - API security measures

Focus on actionable insights and specific recommendations.
```

---

## 🔐 Authentication & Security

### Fix 401/422 Errors

```
Debug the authentication/validation error in this project:

**Error Details:**
- Status: [401/422]
- Endpoint: [ENDPOINT_URL]
- Error message: [ERROR_MESSAGE]

**Investigation Areas:**
1. Token handling in frontend (localStorage, headers)
2. Middleware configuration in Laravel
3. CORS settings between frontend (8200) and backend (8201)
4. Request validation rules and error responses
5. Frontend error handling and user feedback

**Expected Outcome:**
- Clear identification of root cause
- Step-by-step fix with code changes
- Prevention measures for similar issues
- Updated error handling in frontend

Please provide specific file changes and test the fix.
```

### Implement 2FA for New Feature

```
Implement Two-Factor Authentication (2FA) for [FEATURE_NAME] with:

**Requirements:**
- TOTP setup (Google Authenticator compatible)
- Email OTP fallback for development
- Recovery codes (8 single-use codes)
- Admin enforcement option
- Frontend UI components for setup/verification

**Implementation:**
1. Backend: 2FA setup, verification, recovery codes
2. Frontend: QR code display, code input, recovery code management
3. Middleware: 2FA requirement enforcement
4. Tests: Unit tests for 2FA logic, E2E tests for user flow

**Security Considerations:**
- Secure secret storage
- Rate limiting on verification attempts
- Audit logging for 2FA actions
- Graceful fallback mechanisms

Follow existing 2FA patterns in the codebase.
```

---

## 🏗️ CRUD & RBAC Implementation

### Complete CRUD System

```
Create a complete CRUD system for [MODEL_NAME] with role-based access control:

**Database Layer:**
- Migration with proper indexes and foreign keys
- Model with relationships and validation
- Factory and seeder for testing data

**API Layer:**
- Resource controller with full CRUD operations
- Form request validation (Store/Update)
- API resource for consistent responses
- Policy for role-based access control

**Frontend Layer:**
- List page with search, filter, pagination
- Create/Edit forms with validation
- View page with details
- Delete confirmation modal

**Testing:**
- PHPUnit tests for API endpoints
- Vitest tests for frontend components
- Playwright E2E tests for user workflows

**Access Control:**
- Admin: Full CRUD access
- Manager: Create/Read/Update access
- User: Read-only access

Follow existing patterns in ToolsToolController and related components.
```

### RBAC Middleware & Policies

```
Implement Role-Based Access Control (RBAC) for [RESOURCE_NAME]:

**Backend Implementation:**
1. Create Policy class with role-based methods
2. Register policy in AuthServiceProvider
3. Apply middleware to routes (role:admin, role:manager)
4. Add authorization checks in controller methods

**Frontend Implementation:**
1. Create role-based component guards
2. Hide/show UI elements based on user role
3. Add route protection for admin/manager pages
4. Implement proper error handling for unauthorized access

**Role Permissions:**
- Admin: Full access to all operations
- Manager: Limited access (define specific permissions)
- User: Read-only access

**Testing:**
- Test each role's access to protected endpoints
- Test frontend UI visibility based on roles
- Test unauthorized access handling

Use existing CheckRole middleware and role patterns.
```

---

## 🎨 UI Polish & Styling

### Tailwind CSS Component Polish

```
Polish the UI for [COMPONENT/PAGE_NAME] with modern styling:

**Design Requirements:**
- Consistent with existing design system
- Responsive design (mobile-first)
- Dark mode support using CSS variables
- Accessibility compliance (WCAG AA)
- Loading states and error handling

**Styling Improvements:**
1. **Color Scheme**: Use existing CSS variables (--primary, --secondary, --text, --muted)
2. **Typography**: Consistent font sizes and spacing
3. **Interactive States**: Hover, focus, active states
4. **Animations**: Subtle transitions and loading spinners
5. **Layout**: Proper spacing, alignment, and grid system

**Components to Style:**
- [SPECIFIC_COMPONENTS]

**Accessibility Features:**
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

Follow the existing Tailwind patterns in the codebase.
```

### Form Validation & UX

```
Improve form validation and user experience for [FORM_NAME]:

**Validation Improvements:**
1. **Client-side**: Real-time validation with immediate feedback
2. **Server-side**: Comprehensive validation rules with clear error messages
3. **Visual Feedback**: Error states, success states, loading indicators
4. **Accessibility**: Proper error announcements for screen readers

**UX Enhancements:**
- Character counters for text inputs
- Auto-save functionality for long forms
- Clear error messages with actionable guidance
- Progress indicators for multi-step forms
- Confirmation dialogs for destructive actions

**Form Features:**
- [SPECIFIC_FORM_FIELDS]

**Error Handling:**
- Network error recovery
- Validation error display
- Success confirmation
- Loading states during submission

Use existing FormField component patterns and validation styles.
```

---

## ⚡ Performance & Caching

### Redis Caching Implementation

```
Implement Redis caching for [FEATURE_NAME] with intelligent invalidation:

**Caching Strategy:**
1. **Cache Keys**: Consistent naming convention
2. **TTL Settings**: Appropriate expiration times
3. **Cache Warming**: Pre-populate frequently accessed data
4. **Invalidation**: Smart cache clearing on data changes

**Implementation:**
- Create CacheService methods for [FEATURE]
- Add cache middleware for expensive operations
- Implement cache tags for related data
- Add cache metrics and monitoring

**Cache Layers:**
1. **Database Queries**: Cache expensive queries
2. **API Responses**: Cache frequently requested data
3. **Frontend State**: Optimize component re-renders
4. **Static Assets**: Browser caching strategies

**Invalidation Triggers:**
- Data creation, update, deletion
- User role changes
- System configuration updates

Follow existing CacheService patterns for categories and tool counts.
```

### Database Query Optimization

```
Optimize database queries for [FEATURE_NAME]:

**Performance Issues:**
- [SPECIFIC_SLOW_QUERIES]

**Optimization Strategies:**
1. **Eager Loading**: Prevent N+1 query problems
2. **Database Indexes**: Add indexes for frequently queried columns
3. **Query Caching**: Cache expensive aggregation queries
4. **Pagination**: Implement efficient pagination for large datasets

**Implementation:**
- Add proper relationships and eager loading
- Create database indexes for performance
- Implement query result caching
- Add query performance monitoring

**Monitoring:**
- Log slow queries (>100ms)
- Add performance metrics
- Monitor database connection usage
- Track query execution times

Use Laravel's query optimization tools and existing patterns.
```

---

## 👑 Admin Panel Features

### Admin Dashboard Enhancement

```
Enhance the admin dashboard with [SPECIFIC_FEATURES]:

**Dashboard Components:**
1. **Statistics Cards**: Key metrics with trend indicators
2. **Charts**: Visual data representation (bar, line, pie charts)
3. **Recent Activity**: Real-time activity feed
4. **Quick Actions**: Common administrative tasks
5. **System Status**: Health checks and alerts

**Data Sources:**
- User statistics and growth trends
- Tool approval metrics
- System performance indicators
- Security audit summaries

**Interactive Features:**
- Real-time updates via WebSocket or polling
- Filterable date ranges
- Export functionality for reports
- Drill-down capabilities for detailed views

**Responsive Design:**
- Mobile-friendly layout
- Collapsible sections
- Adaptive chart sizing
- Touch-friendly interactions

Follow existing admin dashboard patterns and use Chart.js or similar library.
```

### Data Tables with Advanced Features

```
Create advanced data tables for [RESOURCE_NAME] management:

**Table Features:**
1. **Search**: Global and column-specific search
2. **Filtering**: Multi-column filters with dropdowns
3. **Sorting**: Click-to-sort on all columns
4. **Pagination**: Efficient pagination with page size options
5. **Bulk Actions**: Select multiple rows for batch operations

**Advanced Features:**
- Export to CSV/Excel
- Column visibility toggle
- Row selection with checkboxes
- Inline editing capabilities
- Real-time updates

**User Experience:**
- Loading states during data fetch
- Empty state handling
- Error state with retry options
- Responsive design for mobile

**Performance:**
- Virtual scrolling for large datasets
- Debounced search input
- Optimized API endpoints with proper indexing
- Client-side caching of filter states

Use existing AdminUserList and AdminTools components as reference.
```

---

## 🧪 Testing & Quality Assurance

### Comprehensive Test Suite

```
Create comprehensive tests for [FEATURE_NAME]:

**Backend Tests (PHPUnit):**
1. **Unit Tests**: Model methods, service classes, utilities
2. **Feature Tests**: API endpoints, authentication, authorization
3. **Integration Tests**: Database operations, external services
4. **Test Coverage**: Aim for >90% code coverage

**Frontend Tests (Vitest):**
1. **Component Tests**: React component rendering and interactions
2. **Hook Tests**: Custom hook functionality
3. **Utility Tests**: API functions, formatters, validators
4. **Integration Tests**: Component integration with context

**E2E Tests (Playwright):**
1. **User Workflows**: Complete user journeys
2. **Role-based Testing**: Different user role scenarios
3. **Error Scenarios**: Network failures, validation errors
4. **Cross-browser Testing**: Chrome, Firefox, Safari

**Test Data:**
- Factories for consistent test data
- Seeders for integration test data
- Mock data for API responses
- Test fixtures for complex scenarios

**CI/CD Integration:**
- Automated test runs on PR
- Test result reporting
- Coverage reporting
- Performance regression testing

Follow existing test patterns in the project.
```

### Security Testing

```
Implement security testing for [FEATURE_NAME]:

**Authentication Testing:**
- Token expiration handling
- Invalid token rejection
- Role-based access enforcement
- 2FA bypass attempts

**Input Validation Testing:**
- SQL injection prevention
- XSS attack prevention
- CSRF protection
- File upload security

**Authorization Testing:**
- Privilege escalation attempts
- Unauthorized data access
- Admin function protection
- Resource ownership validation

**API Security Testing:**
- Rate limiting enforcement
- Request size limits
- Content type validation
- Error message information leakage

**Frontend Security Testing:**
- XSS prevention in user input
- Secure token storage
- HTTPS enforcement
- Content Security Policy

Use existing security test patterns and add to security-check.mjs script.
```

---

## 🚀 Deployment & DevOps

### CI/CD Pipeline Setup

```
Set up CI/CD pipeline for this full-stack project:

**GitHub Actions Workflows:**
1. **Pull Request**: Run tests, linting, security checks
2. **Staging Deployment**: Deploy to staging environment
3. **Production Deployment**: Deploy to production with approval
4. **Rollback**: Automated rollback on deployment failure

**Pipeline Stages:**
1. **Code Quality**: ESLint, Prettier, PHP CS Fixer
2. **Testing**: PHPUnit, Vitest, Playwright
3. **Security**: Dependency scanning, secret detection
4. **Build**: Docker image building and optimization
5. **Deploy**: Blue-green deployment strategy

**Environment Management:**
- Staging environment for testing
- Production environment with monitoring
- Environment-specific configuration
- Secret management with GitHub Secrets

**Monitoring & Alerts:**
- Deployment status notifications
- Error rate monitoring
- Performance metrics tracking
- Security incident alerts

**Rollback Strategy:**
- Automated rollback on health check failures
- Database migration rollback procedures
- Frontend deployment rollback
- Communication procedures for incidents

Use Docker Compose for consistent environments.
```

### Production Optimization

```
Optimize the application for production deployment:

**Performance Optimization:**
1. **Frontend**: Bundle optimization, code splitting, lazy loading
2. **Backend**: Query optimization, caching, database indexing
3. **Infrastructure**: CDN setup, load balancing, caching layers
4. **Database**: Connection pooling, query optimization, read replicas

**Security Hardening:**
- HTTPS enforcement with SSL certificates
- Security headers (HSTS, CSP, X-Frame-Options)
- Database encryption at rest and in transit
- API rate limiting and DDoS protection

**Monitoring Setup:**
- Application performance monitoring (APM)
- Error tracking and alerting
- Log aggregation and analysis
- Uptime monitoring and health checks

**Scalability Preparation:**
- Horizontal scaling capabilities
- Database sharding strategy
- Cache clustering setup
- Load balancer configuration

**Backup & Recovery:**
- Automated database backups
- Application state backup
- Disaster recovery procedures
- Data retention policies

Include production Docker configurations and deployment scripts.
```

---

## 📚 Documentation & Maintenance

### Documentation Update

```
Update project documentation for [FEATURE_NAME]:

**README Updates:**
1. **Feature Description**: Clear explanation of new functionality
2. **Installation Steps**: Updated setup instructions
3. **Usage Examples**: Code examples and API usage
4. **Configuration**: Environment variables and settings
5. **Troubleshooting**: Common issues and solutions

**API Documentation:**
- Endpoint documentation with examples
- Request/response schemas
- Authentication requirements
- Error codes and messages

**Code Documentation:**
- Inline comments for complex logic
- PHPDoc for all public methods
- TypeScript interfaces and types
- Component prop documentation

**Architecture Documentation:**
- System architecture diagrams
- Database schema documentation
- API flow diagrams
- Deployment architecture

**User Guides:**
- Admin panel user guide
- Developer setup guide
- Deployment guide
- Troubleshooting guide

Ensure all documentation is accurate and up-to-date with current implementation.
```

### Code Cleanup & Refactoring

```
Perform code cleanup and refactoring for [AREA_NAME]:

**Dead Code Removal:**
- Unused imports and exports
- Unused functions and methods
- Unused CSS classes and styles
- Unused database migrations

**Code Organization:**
- Consistent file structure
- Proper separation of concerns
- Logical component grouping
- Clear naming conventions

**Performance Improvements:**
- Optimize React component renders
- Reduce bundle size
- Optimize database queries
- Implement proper caching

**Code Quality:**
- Consistent code style (ESLint, Prettier)
- Type safety improvements
- Error handling standardization
- Test coverage improvements

**Security Review:**
- Remove hardcoded secrets
- Validate all user inputs
- Implement proper authentication
- Review authorization logic

**Dependencies:**
- Update outdated packages
- Remove unused dependencies
- Audit security vulnerabilities
- Optimize package.json scripts

Provide a summary of all changes and improvements made.
```

---

## 🎯 Usage Tips

### Best Practices

1. **Start with Planning**: Always ask for a plan before implementation
2. **Review Diffs**: Review proposed changes before applying
3. **Test Incrementally**: Test each change before proceeding
4. **Follow Patterns**: Use existing code patterns and conventions
5. **Document Changes**: Update documentation as you go

### Common Modifications

- Replace `[FEATURE_NAME]` with your specific feature
- Replace `[MODEL_NAME]` with your database model
- Replace `[COMPONENT_NAME]` with your React component
- Replace `[ENDPOINT_URL]` with your API endpoint
- Replace `[ERROR_MESSAGE]` with the actual error

### Prompt Combinations

You can combine prompts for complex features:

```
First: "Plan the implementation of user profiles with 2FA"
Then: "Show me the exact diffs for the user profiles feature"
Finally: "Apply the approved changes and add comprehensive tests"
```

---

This collection covers the most common development scenarios. Each prompt is designed to work with the existing codebase patterns and provide clear, actionable results.
