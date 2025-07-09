// Requirements
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const databaseConnection = require("./src/models/connection/database")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
dotenv.config();
// Cloudinary
const cloudinary = require("cloudinary")

const logger = require('./src/utils/info_logger')
const e_logger = require('./src/utils/error_logger')

try {
    logger.info('Cloudinary init')
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
} catch (err) {
    e_logger(err)
}
// PORT
const PORT = process.env.PORT || 7000


// Directions
const logoutRoutes = require('./src/routes/logout')
const userRoutes = require('./src/routes/users')
const authRoutes = require('./src/routes/auth')
const myHotelRoutes = require("./src/routes/my-hotels")
const hotelRoutes = require("./src/routes/hotels")
const viewRoutes = require("./src/routes/views");
const adminRoutes = require('./src/routes/admin');
const adminHotelRoutes = require('./src/routes/admin-hotels');
const bookingRoutes = require('./src/routes/bookings');

// Database Connection
databaseConnection()


// Express configuration
const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));


// Routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/logout", logoutRoutes);
app.use("/my-hotels", myHotelRoutes)
app.use("/hotels", hotelRoutes)
app.use("/", viewRoutes)
app.use("/admin", adminRoutes)
app.use("/admin/hotels", adminHotelRoutes)
app.use("/bookings", bookingRoutes)

// Auth endpoint
app.post('/check', (req, res) => {
    const { auth_token } = req.cookies;
    try {
        // Verifying token
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET_KEY);
        // If token is ok
        return res.status(200).json({ valid: true });
    } catch (error) {
        // If token is not ok
        return res.status(401).json({ message: "Not available" });
    }
});

// Admin auth check endpoint
app.post('/admin/check', (req, res) => {
    const { admin_auth_token } = req.cookies;
    try {
        // Verifying token
        const decoded = jwt.verify(admin_auth_token, process.env.JWT_SECRET_KEY);
        // If token is ok
        return res.status(200).json({ valid: true });
    } catch (error) {
        // If token is not ok
        return res.status(401).json({ message: "Not available" });
    }
});


app.get('/', (req, res) => {
    res.send("Hello World")
})

// Listen config
app.listen(PORT, () => {
    logger.info(`Server is started in ${PORT}`)
});
