const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
//const semesterRoutes = require('./routes/marks');  // Updated route name
const adminRoutes = require('./routes/admin');
const semesterRoutes = require('./routes/semester');  // Updated route name
const mentorGradingRouter = require('./routes/mentorGradingSchema');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // If cookies or other credentials are needed
}));

app.use(express.json());  // Parse incoming requests with JSON payloads

// Connect to DB
connectDB();

// Routes
app.get('/test', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/semester', semesterRoutes);  // Updated endpoint to match unified semester logic
app.use('/api/admin', adminRoutes);
app.use('/api/mentorGrading', mentorGradingRouter);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
