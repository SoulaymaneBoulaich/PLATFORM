# 🏡 Real Estate Platform

> **A modern, full-stack real estate marketplace connecting buyers, sellers, and agents.**

This platform is a comprehensive property management solution featuring role-based dashboards, real-time messaging, and interactive map-based property search.

---

## 📖 Table of Contents

-   [Features](#-features)
-   [Tech Stack](#-tech-stack)
-   [Prerequisites](#-prerequisites)
-   [Installation Guide](#-installation-guide)
-   [Configuration](#-configuration)
-   [Running the Application](#-running-the-application)
-   [Project Structure](#-project-structure)

---

## ✨ Features

-   **User Roles**: Distinct dashboards for **Buyers**, **Sellers**, and **Agents**.
-   **Advanced Search**: Filter properties by location, price, type, and amenities.
-   **Real-time Communication**: Instant messaging powered by **Socket.io**.
-   **Security**: Role-based access control using **JWT**.
-   **Media**: High-quality image galleries.
-   **Interactive Maps**: Dynamic property browsing on maps.

---

## 🛠️ Tech Stack

### Frontend
-   **React 19** + **Vite**
-   **Tailwind CSS** (Styling)
-   **Socket.io Client** (Real-time)
-   **React Leaflet** (Maps)

### Backend
-   **Node.js** + **Express**
-   **MySQL** (Database)
-   **Socket.io** (Real-time Server)
-   **JWT** (Authentication)

---

## 📋 Prerequisites

-   **Node.js** (v18 or higher)
-   **A Railway Account** (OR any MySQL Database provider)

---

## 🚀 Installation Guide

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Database Migration**:
    check the .env file for db info


### 2. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

---

## ▶️ Running the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```
> Server runs on `http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 📁 Project Structure

```
PLATFORM/
├── backend/                 # Express API
│   ├── config/             # DB Config
│   ├── controllers/        # Business Logic
│   ├── models/             # DB Models
│   ├── routes/             # API Endpoints
│   └── server.js           # Entry Point
│
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Views
│   │   └── services/       # API Calls
│   └── vite.config.js
└── README.md
```

Made by:
##   SOULAYMANE BOULAICH | ILHAM FARES | HOUSSAM ELMEZGUELDI | SAFA MOUSSAMIR
