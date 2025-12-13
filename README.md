# Real Estate Platform

A full-stack real estate application with React frontend, Node.js/Express backend, and MySQL database.

## 🚀 Quick Start (Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- That's it! No Node.js, MySQL, or XAMPP needed.

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PLATFORM
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```
   
   First time setup takes 2-3 minutes. The database will automatically initialize with schema and seed data.

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Database**: `localhost:3307`

### Daily Usage

**Start everything:**
```bash
docker compose up -d
```

**Stop everything:**
```bash
docker compose down
```

**View logs:**
```bash
docker compose logs -f
```

**Restart a specific service:**
```bash
docker compose restart backend
# or
docker compose restart frontend
```

---

## 🛠️ Development Mode (Optional)

If you prefer to run frontend/backend manually for faster hot-reload:

### Prerequisites
- Node.js 20+ and npm installed

### Setup

1. **Start only the database**
   ```bash
   docker compose up -d db
   ```

2. **Run backend** (Terminal 1)
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:3001

3. **Run frontend** (Terminal 2)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:3000

### Environment Variables

Backend uses `.env` file. For local development with Docker database:
```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=realestateuser
DB_PASSWORD=StrongPassword123!
DB_NAME=real_estate_db
```

---

## 📦 Project Structure

```
PLATFORM/
├── frontend/           # React + Vite + Tailwind
├── backend/            # Node.js + Express
├── db/                 # Database initialization scripts
│   └── init.sql        # Schema + seed data
├── docker-compose.yml  # Docker orchestration
└── README.md
```

---

## 🗄️ Database

### Access Database Directly

Using a MySQL client (DBeaver, MySQL Workbench, etc.):
- **Host**: `localhost`
- **Port**: `3307`
- **User**: `realestateuser`
- **Password**: `StrongPassword123!`
- **Database**: `real_estate_db`

### Add New Tables

**Option 1: Direct SQL**
```bash
docker exec -it realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db

# Then run CREATE TABLE commands
```

**Option 2: Migration Files**
```bash
# Create migration file
echo "CREATE TABLE your_table (...);" > backend/migrations/001_new_table.sql

# Run migration
docker exec -i realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db < backend/migrations/001_new_table.sql
```

### Reset Database
```bash
# WARNING: This deletes all data!
docker compose down -v
docker compose up -d
```

---

## 🐛 Troubleshooting

### Ports already in use
If you see port errors, another service is using ports 3000, 5000, or 3307:
```bash
# Stop local servers
# Kill any running npm processes
# Then restart Docker
docker compose down
docker compose up -d
```

### Database connection errors
```bash
# Verify database is running
docker ps

# Check database logs
docker logs realestate-db

# Restart database
docker compose restart db
```

### Frontend shows "Failed to load properties"
```bash
# Check backend is responding
curl http://localhost:5000/api/properties

# Check backend logs
docker logs realestate-backend

# Hard refresh browser (Ctrl + F5)
```

### Clear everything and start fresh
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

---

## 🌐 Network Independence

This setup runs **100% locally** on your machine:
- All services communicate via Docker's internal network
- No internet/WiFi required after initial setup
- Same setup works on any machine (Windows/Mac/Linux)
- No configuration changes needed for different networks

---

## 📝 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MySQL2
- **Database**: MySQL 8
- **DevOps**: Docker, Docker Compose

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with `docker compose up --build`
4. Submit a pull request

---

## 📄 License

[Add your license here]