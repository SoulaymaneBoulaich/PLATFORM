# Real Estate Platform - Team Setup Guide

Welcome! This guide will help you set up and run the Real Estate Platform on your laptop from scratch.

## 📖 What You'll Learn

By following this guide, you will:
- Install Docker Desktop (our development environment)
- Clone and run the project
- Access the website on your laptop
- Understand how to start/stop the application

**Time needed**: 15-20 minutes for first-time setup

---

## 🎯 Step 1: Install Docker Desktop

### What is Docker?
Docker is a tool that packages our entire application (database, backend, frontend) into containers. This means:
- ✅ Everyone on the team has the exact same setup
- ✅ No manual database installation needed
- ✅ Works on Windows, Mac, and Linux
- ✅ No conflicts with other software on your laptop

### Installation Steps

#### For Windows:
1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Windows"**
3. Run the installer (Docker Desktop Installer.exe)
4. Follow the installation wizard
   - Click "OK" to enable WSL 2 if prompted
   - Restart your computer when asked
5. After restart, open **Docker Desktop** from your Start menu
6. Wait for Docker to start (you'll see a whale icon in your system tray)

#### For Mac:
1. Go to: https://www.docker.com/products/docker-desktop
2. Click **"Download for Mac"** (choose Intel or Apple Silicon)
3. Open the downloaded .dmg file
4. Drag Docker to your Applications folder
5. Open Docker from Applications
6. Grant permissions when asked
7. Wait for Docker to start (you'll see a whale icon in your menu bar)

#### For Linux:
1. Go to: https://docs.docker.com/desktop/install/linux-install/
2. Choose your Linux distribution
3. Follow the installation instructions
4. Start Docker Desktop after installation

### Verify Docker is Running

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and type:

```bash
docker --version
```

You should see something like: `Docker version 24.0.x`

If you see this, **Docker is ready!** ✅

---

## 🎯 Step 2: Clone the Project

### What is Cloning?
Cloning downloads a copy of the project code to your laptop.

### Steps:

1. **Open your terminal**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type "Terminal", press Enter
   - Linux: Press `Ctrl + Alt + T`

2. **Navigate to where you want to save the project**
   ```bash
   # Example: Save to Desktop
   cd Desktop
   ```

3. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PLATFORM
   ```
   
   > **Note**: Replace `<repository-url>` with the actual Git URL your team lead provides

4. **Verify you're in the right folder**
   ```bash
   # Windows
   dir
   
   # Mac/Linux
   ls
   ```
   
   You should see folders: `backend`, `frontend`, `db`, and a file `docker-compose.yml`

---

## 🎯 Step 3: Start the Application

### First Time Setup (takes 2-3 minutes)

In your terminal (make sure you're in the PLATFORM folder):

```bash
docker compose up --build
```

### What's Happening?

You'll see lots of text scrolling. This is normal! Docker is:
1. ⬇️ Downloading MySQL database (first time only)
2. 🔨 Building the backend
3. 🔨 Building the frontend
4. 🗄️ Creating the database with tables and sample data
5. 🚀 Starting all services

**Wait until you see**:
- `API running on port 5000` (backend ready)
- `ready in XXXms` (frontend ready)

---

## 🎯 Step 4: Open the Website

1. **Open your web browser** (Chrome, Firefox, Edge, Safari)
2. **Go to**: http://localhost:3000

🎉 **You should see the Real Estate Platform!**

You should see:
- Navigation bar (Home, Properties, Agents, Login)
- Featured properties with images
- Property cards showing listings

---

## 🎯 Daily Usage

After the first setup, it's much faster!

### To Start the Application:

```bash
# Go to the project folder
cd Desktop/PLATFORM

# Start everything (takes 10-15 seconds)
docker compose up -d
```

The `-d` flag runs it in the background, so you can close the terminal.

### To Stop the Application:

```bash
docker compose down
```

### To Restart After Making Code Changes:

```bash
docker compose restart backend
# or
docker compose restart frontend
```

---

## 🔍 Verify Everything is Working

### Check if containers are running:
```bash
docker ps
```

You should see 3 containers:
- `realestate-frontend` (port 3000)
- `realestate-backend` (port 5000)
- `realestate-db` (port 3307)

### Check backend is responding:
Open your browser and go to: http://localhost:5000/api/properties

You should see JSON data with property listings.

### Check frontend is working:
Go to: http://localhost:3000

You should see the website with properties displaying.

---

## ❓ Troubleshooting Common Issues

### Issue 1: "Docker is not recognized"
**Problem**: Docker isn't installed or not in PATH  
**Solution**: 
- Make sure Docker Desktop is running (check system tray/menu bar)
- Restart your terminal after installing Docker
- Restart your computer if needed

### Issue 2: "Port 3000 is already in use"
**Problem**: Another application is using port 3000  
**Solution**:
```bash
# Stop any running npm servers
# Then restart Docker
docker compose down
docker compose up -d
```

### Issue 3: "Permission denied" (Linux/Mac)
**Problem**: Docker needs permissions  
**Solution**:
```bash
sudo docker compose up -d
```

### Issue 4: Database connection errors
**Problem**: Database not ready yet  
**Solution**:
```bash
# Wait 30 seconds for database to initialize
# Then restart backend
docker compose restart backend
```

### Issue 5: Frontend shows "Failed to load properties"
**Solutions to try**:
1. Hard refresh your browser: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Check backend is running: `docker ps`
3. Check backend logs: `docker compose logs backend`
4. Restart everything:
   ```bash
   docker compose down
   docker compose up -d
   ```

---

## 🌐 Understanding URLs

When the application is running:

| URL | What it shows | Used for |
|-----|---------------|----------|
| http://localhost:3000 | Website frontend | Regular browsing |
| http://localhost:5000/api/properties | JSON data | Testing API |
| localhost:3307 | MySQL database | Database tools (DBeaver, etc.) |

**localhost** means "this computer" - so it works on any laptop, anywhere, no internet needed!

---

## 🎓 Understanding Docker Commands

Here are the commands you'll use:

```bash
# Start all services
docker compose up -d

# Stop all services  
docker compose down

# View running containers
docker ps

# View logs
docker compose logs

# View logs for a specific service
docker compose logs backend

# Restart a service
docker compose restart backend

# Rebuild and start (after major changes)
docker compose up --build

# Stop and remove everything including data (CAUTION!)
docker compose down -v
```

---

## �️ Adding Tables to the Database

### Method 1: Interactive SQL Terminal (Recommended for Learning)

1. **Open MySQL terminal inside the Docker container:**
   ```bash
   docker exec -it realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db
   ```

2. **You're now in MySQL!** You'll see: `mysql>`

3. **Create your table:**
   ```sql
   CREATE TABLE my_new_table (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Verify it was created:**
   ```sql
   SHOW TABLES;
   DESCRIBE my_new_table;
   ```

5. **Exit MySQL terminal:**
   ```sql
   exit;
   ```

### Method 2: Run SQL from a File (For Migration Scripts)

1. **Create a SQL file** (e.g., `add_reviews_table.sql`):
   ```bash
   # Create in backend/migrations folder
   cd backend/migrations
   # Then create your .sql file
   ```

2. **Example SQL file content:**
   ```sql
   CREATE TABLE IF NOT EXISTS reviews (
       review_id INT PRIMARY KEY AUTO_INCREMENT,
       property_id INT NOT NULL,
       user_id INT NOT NULL,
       rating INT NOT NULL,
       comment TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (property_id) REFERENCES properties(property_id),
       FOREIGN KEY (user_id) REFERENCES users(user_id)
   );
   ```

3. **Run the SQL file:**
   ```bash
   docker exec -i realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db < backend/migrations/add_reviews_table.sql
   ```

### Method 3: Quick One-Line Command

```bash
docker exec -i realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db -e "CREATE TABLE test (id INT PRIMARY KEY);"
```

### Useful SQL Commands

```sql
-- See all tables
SHOW TABLES;

-- See table structure
DESCRIBE table_name;

-- See how table was created
SHOW CREATE TABLE table_name;

-- Drop a table (CAUTION!)
DROP TABLE table_name;

-- Add a column to existing table
ALTER TABLE table_name ADD COLUMN new_column VARCHAR(100);

-- See all data in a table
SELECT * FROM table_name;
```

---

## �💡 Tips for Success

1. **Always start Docker Desktop first** before running commands
2. **Run commands from inside the PLATFORM folder**
3. **If something doesn't work, try**: `docker compose down` then `docker compose up -d`
4. **Check Docker Desktop app** to see if containers are running
5. **Ask the team** if you're stuck - we're here to help!

---

## 🎯 Quick Reference Card

**Save this for daily use:**

```bash
# Navigate to project
cd Desktop/PLATFORM

# Start everything
docker compose up -d

# Open website
# Browser: http://localhost:3000

# Stop everything
docker compose down
```

---

## 🆘 Getting Help

If you're stuck:
1. Check the Troubleshooting section above
2. Ask in the team chat
3. Share your error message for faster help
4. Run `docker compose logs` to see detailed errors

---

## 🎉 You're Ready!

Congratulations! You now know how to:
- ✅ Install Docker
- ✅ Start the application
- ✅ Access the website
- ✅ Stop the application
- ✅ Troubleshoot common issues

Welcome to the team! 🚀