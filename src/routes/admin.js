const express = require('express');
const { check, validationResult } = require('express-validator');
const AdminModel = require('../models/admin');
const Hotel = require('../models/hotel');
const Booking = require('../models/booking');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const verifyAdminToken = require('../middleware/adminAuth');

const logger = require('../utils/info_logger');
const e_logger = require('../utils/error_logger');

// Admin login route
router.post("/login", [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email, password } = req.body;

        // Find admin by email
        const admin = await AdminModel.findOne({ email });

        // Check if admin exists
        if (!admin) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d"
        });

        // Set HTTP cookie
        res.cookie("admin_auth_token", token, {
            httpOnly: true,
            maxAge: 86400000 // 1 day
        });

        res.status(200).json({ adminId: admin._id });
    } catch (err) {
        e_logger.error(`Admin login error: ${err}`);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Admin registration (should be restricted in production)
router.post("/register", [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({ min: 6 }),
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email, password, firstName, lastName } = req.body;

        // Check if admin already exists
        let admin = await AdminModel.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Create new admin
        admin = new AdminModel({
            email,
            password,
            firstName,
            lastName
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d"
        });

        // Set HTTP cookie
        res.cookie("admin_auth_token", token, {
            httpOnly: true,
            maxAge: 86400000 // 1 day
        });

        res.status(201).json({ adminId: admin._id });
    } catch (err) {
        e_logger.error(`Admin registration error: ${err}`);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Admin logout
router.post("/logout", (req, res) => {
    res.cookie("admin_auth_token", "", {
        expires: new Date(0)
    });
    res.send();
});

// Get admin profile
router.get("/me", verifyAdminToken, async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.adminId).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(admin);
    } catch (err) {
        e_logger.error(`Get admin profile error: ${err}`);
        res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router; 