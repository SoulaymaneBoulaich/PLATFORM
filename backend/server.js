const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const agentRoutes = require('./routes/agentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const searchRoutes = require('./routes/searchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const offerRoutes = require('./routes/offerRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const visitRoutes = require('./routes/visitRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api', uploadRoutes); // Upload routes for property images
app.use('/api/agents', agentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', reviewRoutes); // Review routes for properties
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', contactRoutes); // Contact form routes
app.use('/api', notificationRoutes); // Notification routes
app.use('/api', chatRoutes); // Chat routes
app.use('/api/conversations', conversationRoutes); // Conversation routes
app.use('/api/messages', messageRoutes); // Message routes
app.use('/api/search', searchRoutes); // Search and recommendations routes
app.use('/api', profileRoutes); // Profile and settings routes
app.use('/api/offers', offerRoutes); // Offer management routes
app.use('/api/favorites', favoritesRoutes); // Favorites management
app.use('/api/settings', settingsRoutes); // User settings routes
app.use('/api/visits', visitRoutes); // Property visits management

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
