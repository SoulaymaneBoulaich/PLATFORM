# Project Resume: Real Estate Platform

## 1. Project Overview
This project is a comprehensive Real Estate Platform designed to facilitate interactions between Buyers, Sellers, and Agents. It features a full-featured backend API and a modern, responsive frontend application. The platform supports property listings, user management, role-based dashboards, real-time messaging, appointment scheduling, and transaction management.

## 2. Technology Stack

### Backend
-   **Runtime Environment**: Node.js
-   **Framework**: Express.js
-   **Database**: MySQL (using `mysql2` driver with connection pooling)
-   **Authentication**: JSON Web Tokens (JWT), Google OAuth
-   **File Storage**: Cloudinary (via `multer` and `multer-storage-cloudinary`)
-   **Real-time Communication**: (Implied via Chat routes, primarily REST-based polling/updates)
-   **Email Service**: Nodemailer
-   **Security**: bcrypt/bcryptjs for password hashing, cors, express-validator

### Frontend
-   **Build Tool**: Vite
-   **Framework**: React 19
-   **Styling**: TailwindCSS, Vanilla CSS (`index.css`)
-   **Animations**: GSAP (GreenSock), Framer Motion
-   **Routing**: React Router DOM v7
-   **State Management**: React Context API (AuthContext, ThemeContext, RoleThemeContext)
-   **HTTP Client**: Axios
-   **Maps**: Leaflet / React-Leaflet
-   **Internationalization**: i18next, react-i18next
-   **Charts/Analytics**: Chart.js, React-Chartjs-2
-   **Icons**: React Icons, Lucide React

## 3. Backend Architecture

### API Structure
The backend exposes a RESTful API organized with the following main route groups:

-   **Auth** (`/api/auth`): Login, Register, Password Reset, Google Auth.
-   **Users** (`/api/users`): User management, profile updates.
-   **Properties** (`/api/properties`): CRUD operations for property listings (search, filter, details).
-   **Agents** (`/api/agents`): Agent-specific endpoints.
-   **Appointments** (`/api/appointments`): Scheduling and managing visits/appointments.
-   **Reviews** (`/api/reviews`): Property and agent reviews.
-   **Transactions** (`/api/transactions`): Handling financial transactions/records.
-   **Dashboard** (`/api/dashboard`): Data aggregation for role-based dashboards.
-   **Contact** (`/api/contact`): Contact forms and inquiries.
-   **Notifications** (`/api/notifications`): User notifications.
-   **Chat & Messaging** (`/api/chat`, `/api/conversations`, `/api/messages`): Messaging system logic.
-   **Search** (`/api/search`): Advanced search capabilities.
-   **Offers** (`/api/offers`): Management of property offers.
-   **Favorites** (`/api/favorites`): User wishlist/favorites management.
-   **Settings** (`/api/settings`): User preference settings.
-   **Visits** (`/api/visits`): Tracking property visits.

### Database Schema (Key Models)
The application uses a relational MySQL database. Key entities include:
-   **User**: Stores profiles, auth info, and roles (Buyer, Seller, Agent).
-   **Property**: Detailed property listings.
-   **PropertyImage**: Images linked to properties.
-   **Agent**: Agent profiles and credentials.
-   **Appointment**: Bookings between users.
-   **Conversation/Message**: Chat history.
-   **Offer**: Financial offers on properties.
-   **Review**: Ratings and feedback.
-   **Transaction**: Records of completed deals.
-   **Notification**: System alerts.
-   **Favorite**: Saved properties.

## 4. Frontend Architecture

### Page Structure
The frontend is organized into several key areas managed by `react-router-dom`:

-   **Public Pages**:
    -   `Home.jsx`: Landing page.
    -   `Login.jsx`, `Register.jsx`, `SignUp.jsx`: Authentication.
    -   `PropertyList.jsx`: Main search and listing view.
    -   `PropertyDetail.jsx`: Single property view.
    -   `Agents.jsx`, `AgentDetail.jsx`: Agent directories.
    -   `Contact.jsx`: General contact page.

-   **Private/Protected Pages**:
    -   **Dashboards**: `BuyerDashboard.jsx`, `SellerDashboard.jsx` (Role-specific views with stats).
    -   **Communication**: `Messages.jsx` (Chat interface), `Chat.jsx`.
    -   **User Profile & Settings**: `EditProfile.jsx`, `Settings.jsx`, `Favorites.jsx`.
    -   **Management**: `Transactions.jsx`, `Offers.jsx`.

### Key Components
-   **Navigation**: `Navbar.jsx` (Role-aware), `Footer.jsx`.
-   **Display**: `PropertyCard.jsx`, `RoleCard.jsx`, `ImageGallery.jsx`.
-   **Interaction**: `SearchBar.jsx`, `PropertyMap.jsx`, `MakeOfferModal.jsx`, `AppointmentForm.jsx`, `ContactForm.jsx`.
-   **Audio/Media**: `AudioRecorder.jsx`, `AudioPlayer.jsx` (for voice notes in chat).
-   **Feedback**: `Toast.jsx` (Notifications), `SkeletonLoader.jsx` (Loading states).

### Theming & Styling
-   **Role-Based Theming**: `RoleThemeContext` applies distinct color schemes (e.g., specific colors for Buyers, Sellers, Agents) across the app.
-   **Global Theme**: `ThemeContext` manages Light/Dark modes.
-   **Animation**: Used GSAP and Framer Motion for smooth transitions.

### Internationalization
-   Implemented via `i18next` with locale files (e.g., `src/i18n/locales/en.json`) to support multiple languages.

## 5. Key Features
-   **Role-Based Access**: Specialized dashboards and permissions for different user types.
-   **Full-Featured Messaging**: Real-time chat with text, emojis, and voice messages.
-   **Property Management**: Complete flow for listing, searching, favoriting, and offering on properties.
-   **Appointment System**: Integrated scheduling for viewings.
-   **Analytics**: Visual charts for Sellers/Agents to track performance.
-   **Secure File Handling**: Cloudinary integration for robust image uploads.
