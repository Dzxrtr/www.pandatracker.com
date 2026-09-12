# ⚙️ PandaSave Configuration Guide

## Development Setup

### 1. Environment Setup

**Linux/macOS:**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Windows (PowerShell):**
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Configuration

**SQLite (Default - Development):**
```python
# app.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pandaSave.db'
```

**PostgreSQL (Recommended for Production):**
```python
# app.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost:5432/pandaSave'
```

### 3. Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
FLASK_ENV=development
SECRET_KEY=your-development-secret-key
```

Load in Python:
```python
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY', 'default-key')
```

---

## Frontend Configuration

### 1. Change API Base URL

Edit `js/auth.js` and `js/dashboard.js`:

**Development:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**Production:**
```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### 2. Customize Branding

**Logo/Emoji:**
- Find all 🐼 references in HTML files
- Replace with your emoji

**Colors:**
```css
/* css/style.css */
:root {
    --primary-color: #6366f1;      /* Change main color */
    --secondary-color: #ec4899;    /* Change accent */
}
```

**App Name:**
- Replace "PandaSave" with your app name
- Update in all HTML, CSS, and JS files

### 3. Newsletter Integration

**EmailJS Configuration:**
```javascript
// js/newsletter.js
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// Send newsletter emails
emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
    to_email: email,
    subject: "Welcome to PandaSave!"
});
```

---

## Backend Configuration

### 1. Flask Settings

**Development Mode:**
```python
app.config.update(
    DEBUG=True,
    TESTING=False,
    ENV='development'
)
```

**Production Mode:**
```python
app.config.update(
    DEBUG=False,
    TESTING=False,
    ENV='production',
    SECRET_KEY='complex-secret-key'
)
```

### 2. CORS Settings

**Allow Multiple Origins:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:8000",
            "http://localhost:3000",
            "https://yourdomain.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### 3. Database Initialization

**First Run:**
```bash
python app.py
# This automatically creates tables
```

**Reset Database:**
```bash
rm pandaSave.db
python app.py
```

**Backup Database:**
```bash
cp pandaSave.db pandaSave.backup.db
```

### 4. User Roles (Future Implementation)

Create role system:
```python
class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)
    
class UserRole(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
```

---

## Deployment Configuration

### 1. Production Server (Gunicorn)

**Install:**
```bash
pip install gunicorn
```

**Run:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**With Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. HTTPS/SSL Configuration

**Let's Encrypt Setup:**
```bash
certbot certonly --standalone -d yourdomain.com
```

**Nginx SSL:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... rest of config
}
```

### 3. Environment for Production

Create `.env.production`:
```
FLASK_ENV=production
DEBUG=False
SECRET_KEY=very-complex-secret-key-here
DATABASE_URL=postgresql://user:password@db.host:5432/pandaSave
```

### 4. Logging Configuration

**Development Logging:**
```python
import logging

logging.basicConfig(level=logging.DEBUG)
```

**Production Logging:**
```python
import logging
from logging.handlers import RotatingFileHandler

file_handler = RotatingFileHandler(
    'logs/app.log',
    maxBytes=10240000,  # 10MB
    backupCount=10
)
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
```

---

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: production
      SECRET_KEY: your-secret-key
      DATABASE_URL: postgresql://postgres:password@db:5432/pandaSave
    depends_on:
      - db

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pandaSave

volumes:
  postgres_data:
```

**Run:**
```bash
docker-compose up -d
```

---

## Performance Optimization

### 1. Database Indexing

```python
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    date = db.Column(db.Date, index=True)
```

### 2. Caching

```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/statistics/<int:user_id>')
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_statistics(user_id):
    # ...
```

### 3. Query Optimization

```python
# Avoid N+1 queries
transactions = Transaction.query.options(
    db.joinedload(Transaction.user)
).all()
```

---

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input validation on all endpoints
- [ ] Use prepared statements for queries
- [ ] Implement CSRF protection
- [ ] Add password complexity requirements
- [ ] Enable CORS security headers
- [ ] Implement API key authentication option
- [ ] Add audit logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor for unusual activity

---

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Check API health
curl http://localhost:5000/api/health
```

### 2. Database Maintenance

```python
# Vacuum SQLite database
import sqlite3
conn = sqlite3.connect('pandaSave.db')
conn.execute('VACUUM')
conn.close()
```

### 3. Log Analysis

```bash
# Monitor logs in real-time
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log
```

---

## Feature Flags

### Enable/Disable Features

```python
# app.py
FEATURES = {
    'newsletter': True,
    'goals': True,
    'calculator': True,
    'reports': True,
    'charts': True,
}

@app.route('/api/features')
def get_features():
    return jsonify(FEATURES)
```

---

## Scaling Considerations

**Horizontal Scaling:**
- Use load balancer (Nginx, HAProxy)
- Database connection pooling
- Session storage in Redis

**Vertical Scaling:**
- Increase server RAM
- Optimize database queries
- Implement caching layer

---

## Backup & Recovery

**Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp pandaSave.db $BACKUP_DIR/pandaSave_$DATE.db
gzip $BACKUP_DIR/pandaSave_$DATE.db
```

**Schedule with Cron:**
```bash
0 2 * * * /path/to/backup.sh  # Daily at 2 AM
```

---

## Troubleshooting

### Database Locked Error
```python
# Solution: Use WAL mode for SQLite
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'timeout': 15}
}
```

### Memory Leaks
```bash
# Monitor process
watch -n 1 'ps aux | grep app.py'

# Profile with memory_profiler
pip install memory-profiler
```

### Slow Queries
```python
from flask_sqlalchemy import get_debug_queries

@app.after_request
def after_request(response):
    for query in get_debug_queries():
        if query.duration >= 0.5:
            app.logger.warning(f'Slow query: {query.statement}')
    return response
```

---

## Support & Updates

- Check for security updates regularly
- Subscribe to Flask/SQLAlchemy changelogs
- Test updates in development first
- Keep dependencies updated with: `pip list --outdated`

---

**Happy configuring! 🐼**
