const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const semesterRoutes = require('./routes/semester');
const mentorGradingRouter = require('./routes/mentorGradingSchema');
const superAdminRoutes = require("./routes/superadmin");


dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));




// Increase payload size limit
app.use(express.json({ limit: '50mb' }));  
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to DB
connectDB();

// Routes
app.get('/test', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentorGrading', mentorGradingRouter);

app.use("/api/superadmin", superAdminRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
