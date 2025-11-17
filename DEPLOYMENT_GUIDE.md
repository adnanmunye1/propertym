# PropertyM Deployment Guide

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Prerequisites](#prerequisites)
3. [Docker Deployment (Recommended)](#docker-deployment-recommended)
4. [Manual Deployment](#manual-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Deployment Options

PropertyM can be deployed in several ways:

1. **Docker Compose** (Recommended) - Easiest, includes all services
2. **Manual** - Traditional server setup
3. **Cloud Platforms** - AWS, DigitalOcean, Azure, etc.

---

## Prerequisites

### System Requirements

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 20 GB storage
- Ubuntu 20.04+ / Debian 11+ / macOS

**Recommended:**
- 4 CPU cores
- 8 GB RAM
- 50 GB storage
- Ubuntu 22.04 LTS

### Software Requirements

- Docker & Docker Compose (for Docker deployment)
- Node.js 20+ (for manual deployment)
- PostgreSQL 15+ (for manual deployment)
- Nginx (optional, for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

---

## Docker Deployment (Recommended)

### 1. Install Docker

**Ubuntu/Debian:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**macOS:**
```bash
brew install docker docker-compose
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone <repository-url> propertym
cd propertym
sudo chown -R $USER:$USER .
```

### 3. Configure Environment

```bash
# Run setup script
./setup-production.sh

# Or manually create .env
cp .env.example .env
nano .env
```

**Edit .env file:**
```bash
# Set strong passwords and secrets
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_min_32_chars

# Set your domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 4. Deploy

```bash
# Build and start all services
./deploy.sh

# Or manually:
docker-compose build
docker-compose up -d
```

### 5. Verify Deployment

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Health check
curl http://localhost:5000/api/health
curl http://localhost:3000
```

### 6. Create Admin User

```bash
docker-compose exec backend node -e "
const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync('YourPassword123!', 10));
"

# Then create user via database or API
```

Or use the API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "OWNER"
  }'
```

---

## Manual Deployment

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx
```

### 2. Setup Database

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE propertym_db;
CREATE USER propertym WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE propertym_db TO propertym;
\q
```

### 3. Deploy Backend

```bash
# Clone and setup
cd /opt
sudo git clone <repository-url> propertym
cd propertym/backend
sudo chown -R $USER:$USER .

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env

# Set DATABASE_URL and other variables
DATABASE_URL="postgresql://propertym:your_password@localhost:5432/propertym_db"
JWT_SECRET="your_32_char_secret_here"
JWT_REFRESH_SECRET="your_32_char_refresh_secret"
NODE_ENV=production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Test
node dist/index.js
```

### 4. Deploy Frontend

```bash
cd /opt/propertym/frontend

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env.local
nano .env.local

# Set API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Build
npm run build

# Test
npm start
```

### 5. Setup PM2 (Process Manager)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /opt/propertym/backend
pm2 start dist/index.js --name propertym-backend

# Start frontend
cd /opt/propertym/frontend
pm2 start npm --name propertym-frontend -- start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
# Follow the instructions
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/propertym
```

Add configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/propertym /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Cloud Deployment

### DigitalOcean

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - Minimum: 2 vCPUs, 4 GB RAM
   - Add SSH key

2. **Connect and Deploy**
   ```bash
   ssh root@your_droplet_ip
   
   # Follow Docker Deployment steps above
   ```

3. **Point Domain**
   - Add A record: `yourdomain.com` → Droplet IP
   - Add A record: `api.yourdomain.com` → Droplet IP

### AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t3.medium or larger
   - Security group: Allow 22, 80, 443, 3000, 5000

2. **Deploy Application**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-ip
   
   # Follow Docker Deployment steps
   ```

3. **Configure Route 53**
   - Create hosted zone
   - Add A records for domain and api subdomain

### AWS ECS (Docker)

1. **Push images to ECR**
   ```bash
   # Build images
   docker build -t propertym-backend ./backend
   docker build -t propertym-frontend ./frontend
   
   # Tag and push
   aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
   docker tag propertym-backend:latest <ecr-url>/propertym-backend:latest
   docker push <ecr-url>/propertym-backend:latest
   ```

2. **Create ECS Task Definition** with both containers

3. **Create ECS Service** with load balancer

### Heroku

**Backend:**
```bash
cd backend

# Create app
heroku create propertym-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

**Frontend:**
```bash
cd frontend

# Create app
heroku create propertym-web

# Set environment
heroku config:set NEXT_PUBLIC_API_URL=https://propertym-api.herokuapp.com/api

# Deploy
git push heroku main
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare (Free)

1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"
5. Configure page rules if needed

---

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=min_32_chars_secure_secret
JWT_REFRESH_SECRET=min_32_chars_secure_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
LOG_LEVEL=info
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Security Best Practices

1. **Never commit .env files**
2. **Use strong secrets** (32+ characters)
3. **Enable HTTPS** everywhere
4. **Configure CORS** properly
5. **Set secure cookie options**
6. **Regular security updates**

---

## Post-Deployment

### 1. Create Admin User

See step 6 in Docker Deployment section.

### 2. Test System

```bash
# Test API
curl https://api.yourdomain.com/api/health

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword"}'

# Access frontend
open https://yourdomain.com
```

### 3. Setup Monitoring

**Install monitoring tools:**
```bash
# Node exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.0.linux-amd64.tar.gz
sudo cp node_exporter-1.6.0.linux-amd64/node_exporter /usr/local/bin/
```

**Setup log rotation:**
```bash
sudo nano /etc/logrotate.d/propertym
```

```
/opt/propertym/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
```

### 4. Setup Backups

See ADMIN_GUIDE.md for backup procedures.

**Quick setup:**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-propertym.sh

# Make executable
sudo chmod +x /usr/local/bin/backup-propertym.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-propertym.sh
```

### 5. Configure Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check individual service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart services
docker-compose restart
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Check connection
docker-compose exec db psql -U propertym -d propertym_db -c "SELECT 1"

# Check DATABASE_URL in .env
```

### Frontend Can't Connect to Backend

1. Check NEXT_PUBLIC_API_URL is correct
2. Check CORS configuration in backend
3. Check backend is accessible
4. Check firewall rules

### SSL Issues

```bash
# Test SSL
curl -I https://yourdomain.com

# Renew certificate
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

### High Memory Usage

```bash
# Check container resources
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## Maintenance

### Update Application

```bash
# Pull latest code
cd /opt/propertym
git pull

# Rebuild and restart
./deploy.sh

# Or manually
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Migrations

```bash
# Run new migrations
docker-compose exec backend npx prisma migrate deploy

# Or manually
cd /opt/propertym/backend
npx prisma migrate deploy
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## Performance Optimization

### Nginx Caching

Add to nginx configuration:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;

location /api {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... other proxy settings
}
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_tenancies_tenant ON tenancies("tenantId");
CREATE INDEX idx_payments_tenant ON payments("tenantId");
CREATE INDEX idx_invoices_tenant ON invoices("tenantId");

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Docker Optimization

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Checklist

Before going live:

- [ ] Domain configured and pointing to server
- [ ] SSL certificate installed and working
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Admin user created
- [ ] Backups configured and tested
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Log rotation configured
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation provided to users

---

## Support

For issues during deployment:

1. Check logs: `docker-compose logs`
2. Review this guide
3. Check ADMIN_GUIDE.md
4. Review error messages carefully
5. Check firewall and network settings

---

*Last updated: Week 8 - Production Ready*

