const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotel');
const verifyAdminToken = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
const logger = require('../utils/info_logger');
const e_logger = require('../utils/error_logger');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Get all hotels (admin only)
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ lastUpdated: -1 });
        res.json(hotels);
    } catch (err) {
        e_logger.error(`Admin get all hotels error: ${err}`);
        res.status(500).json({ message: "Error fetching hotels" });
    }
});

// Get hotel by ID (admin only)
router.get('/:id', verifyAdminToken, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.json(hotel);
    } catch (err) {
        e_logger.error(`Admin get hotel by ID error: ${err}`);
        res.status(500).json({ message: "Error fetching hotel" });
    }
});

// Create hotel (admin only)
router.post('/', [
    verifyAdminToken,
    check("name", "Hotel name is required").notEmpty(),
    check("city", "City is required").notEmpty(),
    check("country", "Country is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("type", "Hotel type is required").notEmpty(),
    check("pricePerNight", "Price per night is required").isNumeric(),
    check("adultCount", "Adult count is required").isNumeric(),
    check("childCount", "Child count is required").isNumeric(),
    check("starRating", "Star rating is required").isNumeric(),
    check("facilities", "Facilities are required").isArray()
], upload.array("imageFiles", 6), async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const newHotel = req.body;
        const imageFiles = req.files;

        // Process image uploads if files are provided
        if (imageFiles && imageFiles.length > 0) {
            // Upload the images to cloudinary
            const uploadPromises = imageFiles.map(async (image) => {
                const b64 = Buffer.from(image.buffer).toString("base64");
                let dataURI = "data:" + image.mimetype + ";base64," + b64;
                const res = await cloudinary.uploader.upload(dataURI);
                return res.url;
            });

            // Add the urls to the new hotel
            const imageUrls = await Promise.all(uploadPromises);
            newHotel.imageUrls = imageUrls;
        } else if (newHotel.imageUrls && !Array.isArray(newHotel.imageUrls)) {
            // Convert string to array if needed
            newHotel.imageUrls = [newHotel.imageUrls];
        }

        // Ensure imageUrls exists and is an array
        if (!newHotel.imageUrls || !newHotel.imageUrls.length) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Create and save the hotel
        const hotel = new Hotel({
            ...newHotel,
            userId: req.adminId, // Use adminId as userId for admin-created hotels
            lastUpdated: new Date()
        });

        await hotel.save();
        res.status(201).json(hotel);
    } catch (err) {
        e_logger.error(`Admin create hotel error: ${err}`);
        res.status(500).json({ message: "Error creating hotel" });
    }
});

// Update hotel (admin only)
router.put('/:id', [
    verifyAdminToken,
    check("name", "Hotel name is required").notEmpty(),
    check("city", "City is required").notEmpty(),
    check("country", "Country is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("type", "Hotel type is required").notEmpty(),
    check("pricePerNight", "Price per night is required").isNumeric(),
    check("adultCount", "Adult count is required").isNumeric(),
    check("childCount", "Child count is required").isNumeric(),
    check("starRating", "Star rating is required").isNumeric(),
    check("facilities", "Facilities are required").isArray()
], upload.array("imageFiles", 6), async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const updateData = req.body;
        const imageFiles = req.files;

        // Process image uploads if files are provided
        if (imageFiles && imageFiles.length > 0) {
            // Upload the images to cloudinary
            const uploadPromises = imageFiles.map(async (image) => {
                const b64 = Buffer.from(image.buffer).toString("base64");
                let dataURI = "data:" + image.mimetype + ";base64," + b64;
                const res = await cloudinary.uploader.upload(dataURI);
                return res.url;
            });

            // Add the urls to the existing imageUrls
            const newImageUrls = await Promise.all(uploadPromises);

            // Handle imageUrls properly
            if (updateData.imageUrls) {
                // If imageUrls is a string, convert to array
                if (typeof updateData.imageUrls === 'string') {
                    updateData.imageUrls = [updateData.imageUrls];
                }
            } else {
                updateData.imageUrls = [];
            }

            // Combine existing and new image URLs
            updateData.imageUrls = [...updateData.imageUrls, ...newImageUrls];
        }

        // Ensure imageUrls exists and is an array
        if (!updateData.imageUrls || !updateData.imageUrls.length) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Update hotel fields
        Object.keys(updateData).forEach(key => {
            hotel[key] = updateData[key];
        });
        hotel.lastUpdated = new Date();

        await hotel.save();
        res.json(hotel);
    } catch (err) {
        e_logger.error(`Admin update hotel error: ${err}`);
        res.status(500).json({ message: "Error updating hotel" });
    }
});

// Delete hotel (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ message: "Hotel deleted successfully" });
    } catch (err) {
        e_logger.error(`Admin delete hotel error: ${err}`);
        res.status(500).json({ message: "Error deleting hotel" });
    }
});

module.exports = router; 