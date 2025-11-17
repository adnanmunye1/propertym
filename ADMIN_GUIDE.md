# PropertyM Administrator Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Initial Setup](#initial-setup)
3. [User Management](#user-management)
4. [Database Management](#database-management)
5. [Backup & Recovery](#backup--recovery)
6. [Security](#security)
7. [Performance Monitoring](#performance-monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Tasks](#maintenance-tasks)
10. [System Updates](#system-updates)

---

## System Overview

### Architecture

PropertyM consists of three main components:

1. **Frontend**: Next.js application (Port 3000)
2. **Backend**: Express.js API (Port 5000)
3. **Database**: PostgreSQL (Port 5432)

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15+
- **Authentication**: JWT tokens
- **File Storage**: Local filesystem

---

## Initial Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker (for containerized deployment)
- Git (for version control)

### Development Setup

#### 1. Clone Repository

```bash
cd /path/to/install
git clone <repository-url> propertym
cd propertym
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file (see backend/.env.example)
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start backend
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file (see frontend/.env.example)
cp .env.example .env.local
# Edit .env.local with API URL

# Start frontend
npm run dev
```

#### 4. Create First Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "OWNER"
  }'
```

### Production Setup with Docker

See [DEPLOYMENT_GUIDE.md](#deployment-guide) for detailed instructions.

**Quick Start:**

```bash
# Setup production environment
./setup-production.sh

# Review and edit .env file
nano .env

# Deploy
./deploy.sh
```

---

## User Management

### User Roles

PropertyM has a single user role: **OWNER**

- Full access to all features
- Can manage properties, units, tenants
- Can record payments and generate reports
- Can upload and manage documents

### Creating Users

Users must be created via API (no self-registration):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER"
  }'
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Resetting User Passwords

Currently, password reset must be done via database:

```bash
# Connect to database
psql -U propertym -d propertym_db

# Generate password hash (use bcrypt)
# Then update user:
UPDATE users SET password = '<bcrypt-hash>' WHERE email = 'user@example.com';
```

**Recommended:** Implement password reset feature in future versions.

---

## Database Management

### Accessing the Database

#### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens GUI at http://localhost:5555

#### Using psql

```bash
psql -U propertym -d propertym_db
```

### Common Database Queries

**View all users:**
```sql
SELECT id, email, "firstName", "lastName", role, "createdAt" FROM users;
```

**Check system statistics:**
```sql
SELECT 
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM units) as total_units,
  (SELECT COUNT(*) FROM tenants) as total_tenants,
  (SELECT COUNT(*) FROM tenancies WHERE status = 'ACTIVE') as active_tenancies;
```

**View tenants with arrears:**
```sql
SELECT 
  t.id, t."firstName", t."lastName", 
  tn.balance, u."unitNumber", p.name as property
FROM tenants t
JOIN tenancies tn ON t.id = tn."tenantId"
JOIN units u ON tn."unitId" = u.id
JOIN properties p ON u."propertyId" = p.id
WHERE tn.balance < 0 AND tn.status = 'ACTIVE'
ORDER BY tn.balance ASC;
```

### Database Migrations

**Run pending migrations:**
```bash
cd backend
npx prisma migrate deploy
```

**Create new migration:**
```bash
npx prisma migrate dev --name description_of_changes
```

**Reset database (CAUTION!):**
```bash
npx prisma migrate reset
```

---

## Backup & Recovery

### Automated Backups

#### PostgreSQL Backups

**Create backup script:**

```bash
#!/bin/bash
# /usr/local/bin/backup-propertym.sh

BACKUP_DIR="/var/backups/propertym"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="propertym_db"
DB_USER="propertym"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER -F c $DB_NAME > $BACKUP_DIR/db_$TIMESTAMP.dump

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.dump

# Delete backups older than 30 days
find $BACKUP_DIR -name "db_*.dump.gz" -mtime +30 -delete

echo "Backup completed: db_$TIMESTAMP.dump.gz"
```

**Schedule with cron:**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-propertym.sh
```

#### File Storage Backups

**Backup uploads directory:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/propertym"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
UPLOADS_DIR="/path/to/propertym/backend/uploads"

tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C $UPLOADS_DIR .

# Delete backups older than 30 days
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
```

### Manual Backups

**Database:**
```bash
pg_dump -U propertym -F c propertym_db > backup_$(date +%Y%m%d).dump
```

**Uploads:**
```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restore from Backup

**Restore database:**
```bash
# Stop application first
docker-compose down

# Restore
pg_restore -U propertym -d propertym_db -c backup_20240115.dump

# Start application
docker-compose up -d
```

**Restore uploads:**
```bash
cd backend
tar -xzf uploads_backup_20240115.tar.gz -C uploads/
```

---

## Security

### Security Features

✅ **Rate Limiting**
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- File uploads: 50 per hour

✅ **Authentication**
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- HTTP-only cookies for refresh tokens

✅ **Security Headers**
- Helmet.js for security headers
- CORS configured
- Content Security Policy

✅ **Input Validation**
- Zod schema validation
- SQL injection prevention (Prisma)
- XSS protection

### Security Checklist

**Production Deployment:**

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set secure session cookies
- [ ] Disable debug mode
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Regular security updates
- [ ] Implement backup strategy

### Monitoring Security

**Check logs regularly:**

```bash
# Backend logs
tail -f backend/logs/error.log
tail -f backend/logs/combined.log

# Docker logs
docker-compose logs -f backend
```

**Watch for:**
- Failed login attempts
- Rate limit violations
- Unusual API access patterns
- Error spikes

---

## Performance Monitoring

### System Resources

**Monitor Docker containers:**
```bash
docker stats
```

**Check container health:**
```bash
docker-compose ps
```

### Database Performance

**Check database connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

**Identify slow queries:**
```sql
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Application Logs

**Backend logs location:**
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Errors only

**View logs:**
```bash
# Last 100 lines
tail -n 100 backend/logs/combined.log

# Follow logs
tail -f backend/logs/combined.log

# Search for errors
grep "ERROR" backend/logs/combined.log
```

---

## Troubleshooting

### Backend Won't Start

**Check:**
1. Database connection
2. Environment variables
3. Port availability
4. Node version (requires 20+)

```bash
# Check if port 5000 is in use
lsof -i :5000

# Test database connection
psql -U propertym -d propertym_db -c "SELECT 1"

# Check logs
docker-compose logs backend
```

### Frontend Won't Start

**Check:**
1. Backend is running
2. API URL is correct
3. Port availability
4. Node version

```bash
# Check if port 3000 is in use
lsof -i :3000

# Verify API connection
curl http://localhost:5000/api/health

# Check logs
docker-compose logs frontend
```

### Database Connection Issues

**Check:**
1. PostgreSQL is running
2. Credentials are correct
3. Database exists
4. Network connectivity

```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Test connection
psql -U propertym -d propertym_db

# Check database exists
psql -U propertym -l
```

### High CPU/Memory Usage

**Diagnose:**
```bash
# Check container resources
docker stats

# Check database queries
# Connect to DB and run:
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Solutions:**
- Optimize database queries
- Increase resource limits
- Check for memory leaks
- Review slow endpoints

---

## Maintenance Tasks

### Daily

- ✅ Check error logs
- ✅ Monitor system resources
- ✅ Verify backups completed

### Weekly

- ✅ Review security logs
- ✅ Check disk space
- ✅ Test backup restoration
- ✅ Review application metrics

### Monthly

- ✅ Update dependencies
- ✅ Review and archive old logs
- ✅ Database maintenance (VACUUM)
- ✅ Security audit

### Database Maintenance

**Optimize database:**
```sql
VACUUM ANALYZE;
```

**Check table sizes:**
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Clean up old logs:**
```bash
find backend/logs -name "*.log" -mtime +90 -delete
```

---

## System Updates

### Updating the Application

```bash
# Stop application
docker-compose down

# Pull latest code
git pull

# Update backend dependencies
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Update frontend dependencies
cd ../frontend
npm install

# Rebuild and restart
cd ..
docker-compose build
docker-compose up -d
```

### Updating Node.js

```bash
# Check current version
node --version

# Update using nvm
nvm install 20
nvm use 20

# Or using package manager
brew upgrade node
```

### Updating PostgreSQL

**Backup first!**

```bash
# Backup database
pg_dump -U propertym propertym_db > backup_before_upgrade.sql

# Update PostgreSQL (method depends on OS)
# Ubuntu/Debian:
sudo apt update
sudo apt upgrade postgresql

# macOS:
brew upgrade postgresql
```

---

## Environment Variables Reference

### Backend (.env)

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-refresh-secret-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
LOG_LEVEL=info
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Docker Compose (.env)

See `.env.example` in root directory.

---

## Support & Resources

### Documentation

- **README.md** - Project overview
- **API_DOCUMENTATION.md** - API reference
- **USER_GUIDE.md** - End-user guide
- **DEPLOYMENT_GUIDE.md** - Deployment instructions
- **TECH_STACK.md** - Technology details
- **ARCHITECTURE.md** - System architecture

### Useful Commands

```bash
# View all running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Stop all services
docker-compose down

# Start with fresh build
docker-compose up -d --build

# Access database
docker-compose exec db psql -U propertym -d propertym_db

# Execute command in container
docker-compose exec backend npm run prisma:studio
```

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Strong JWT secrets generated
- [ ] Database properly configured
- [ ] HTTPS/SSL enabled
- [ ] CORS configured for production domain
- [ ] Firewall rules configured
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Admin user created
- [ ] User documentation provided
- [ ] Performance tested
- [ ] Security audit completed

---

*Last updated: Week 8 - Production Ready*

