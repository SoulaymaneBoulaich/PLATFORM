# 🏡 Real Estate Platform

> **A modern, full-stack real estate marketplace connecting buyers, sellers, and agents.**

This platform is a comprehensive solution for property management and real estate transactions, featuring role-based dashboards, real-time messaging, and interactive map-based property search.

---

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation & Running](#installation--running)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 👤 User Roles
- **Buyers**: Search properties, save favorites, make offers, chat with agents/sellers.
- **Sellers**: List properties, manage offers, track views/favorites analytics, manage profile.
- **Agents**: specialized dashboard, manage multiple listings, verified profile status.

### 🏠 Property Management
- **Advanced Search**: Filter by location, price, type, amenities.
- **Interactive Maps**: Browse properties on a dynamic map (Leaflet).
- **Rich Media**: High-quality image galleries for listings.
- **Details**: Comprehensive info including amenities, location, and agent details.

### 💬 Communication & core
- **Real-time Chat**: Instant messaging between users (Socket.io).
- **Notifications**: Instant alerts for offers, messages, and status updates.
- **Live Updates**: Real-time status changes for properties and offers.
- **Global Search**: Powerful search across properties and agents.

### 🔐 Security & UX
- **Secure Auth**: JWT-based authentication with role-based access control.
- **Modern UI**: Responsive, dark/light mode supported, animated transitions (Framer Motion).
- **Multi-language**: Internationalization support (i18n).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **State & Logic**: Context API, React Router v7
- **Maps**: React Leaflet
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion, GSAP
- **HTTP**: Axios

### Backend
- **Server**: Node.js + Express
- **Database**: MySQL (using mysql2)
- **Auth**: JSON Web Tokens (JWT), Bcrypt
- **Storage**: Cloudinary (for image uploads)
- **Real-time**: Socket.io Server
- **Email**: Nodemailer

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: MySQL Container
- **CI/CD**: GitHub Actions (implied)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Docker Desktop** (Recommended) - [Download Here](https://www.docker.com/products/docker-desktop)
- *Alternatively*: Node.js v18+ and MySQL 8.0 locally installed.

### Environment Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd PLATFORM
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the `PLATFORM` directory (root) or rely on docker defaults. Required variables include:

    ```env
    # Database Configuration
    DB_HOST=mysql_container_name_or_localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=real_estate_db
    
    # Backend Config
    PORT=5000
    JWT_SECRET=your_jwt_secret_key
    NODE_ENV=development
    
    # Cloudinary (Image Uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

### Installation & Running

The easiest way to run the application is using **Docker Compose**.

1.  **Start the Application**:
    ```bash
    docker compose up --build
    ```
    *This will build the frontend and backend images, start the MySQL database, and launch the services.*

2.  **Access the Application**:
    - **Frontend (Website)**: [http://localhost:3000](http://localhost:3000)
    - **Backend (API)**: [http://localhost:5000](http://localhost:5000)
    - **Database**: `localhost:3306` (or port defined in docker-compose)

3.  **Stop the Application**:
    ```bash
    docker compose down
    ```

#### Running Manually (Without Docker)

<details>
<summary>Click to see manual setup instructions</summary>

**Backend:**
```bash
cd backend
npm install
npm run dev
# Server starts on port 5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App starts on port 5173 (usually, check console)
```
</details>

---

## 📁 Project Structure

```
PLATFORM/
├── backend/                 # Express Server & API
│   ├── config/             # DB & App Configuration
│   ├── controllers/        # Request Handlers
│   ├── middleware/         # Auth & Validation Middleware
│   ├── models/             # Database Models
│   ├── routes/             # API Routes
│   └── server.js           # Entry Point
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # Global State (Auth, Theme, etc.)
│   │   ├── pages/          # Application Views
│   │   └── services/       # API Calls
│   └── vite.config.js      # Build Config
│
├── db/                     # Database scripts/seeds
├── docker-compose.yml      # Docker Orchestration
└── README.md               # You are here
```

---

## 📖 API Documentation

The backend provides a RESTful API for all platform operations.
For detailed documentation on API routes, architecture, and database schemas, please refer to:

👉 **[TECHNICAL_DOCUMENTATION_REPORT.md](./TECHNICAL_DOCUMENTATION_REPORT.md)**

---

## ❓ Troubleshooting

**Common Docker Issues:**
*   **Port Conflicts:** Ensure ports 3000, 5000, and 3306 are free.
*   **Database Connection:** If the backend fails to connect immediately, wait 30 seconds for the MySQL container to initialize and restart the backend container.
    ```bash
    docker compose restart backend
    ```

**Frontend Issues:**
*   If you see "Network Error", ensure the backend is running and the API URL is correctly configured in the frontend (usually defaults to `http://localhost:5000`).

---

**Built with ❤️ by the Real Estate Platform Team.**