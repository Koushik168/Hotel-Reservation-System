const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Hotel = require('../models/hotel');
const verifyToken = require('../middleware/auth');
const verifyAdminToken = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
const logger = require('../utils/info_logger');
const e_logger = require('../utils/error_logger');

// Create a new booking (user)
router.post('/', [
    verifyToken,
    check("hotelId", "Hotel ID is required").notEmpty(),
    check("checkIn", "Check-in date is required").isISO8601(),
    check("checkOut", "Check-out date is required").isISO8601(),
    check("adultCount", "Adult count is required").isNumeric(),
    check("childCount", "Child count is required").isNumeric(),
    check("totalCost", "Total cost is required").isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        // Check if hotel exists
        const hotel = await Hotel.findById(req.body.hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const booking = new Booking({
            ...req.body,
            userId: req.userId,
            status: 'pending'
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        e_logger.error(`Create booking error: ${err}`);
        res.status(500).json({ message: "Error creating booking" });
    }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        e_logger.error(`Get user bookings error: ${err}`);
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// Get booking by ID (user)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking belongs to user
        if (booking.userId !== req.userId) {
            return res.status(403).json({ message: "Not authorized to access this booking" });
        }

        res.json(booking);
    } catch (err) {
        e_logger.error(`Get booking by ID error: ${err}`);
        res.status(500).json({ message: "Error fetching booking" });
    }
});

// Cancel booking (user)
router.put('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking belongs to user
        if (booking.userId !== req.userId) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (err) {
        e_logger.error(`Cancel booking error: ${err}`);
        res.status(500).json({ message: "Error cancelling booking" });
    }
});

// ADMIN ROUTES

// Get all bookings (admin only)
router.get('/admin/all', verifyAdminToken, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        e_logger.error(`Admin get all bookings error: ${err}`);
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// Get booking by ID (admin)
router.get('/admin/:id', verifyAdminToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(booking);
    } catch (err) {
        e_logger.error(`Admin get booking by ID error: ${err}`);
        res.status(500).json({ message: "Error fetching booking" });
    }
});

// Update booking status (admin only)
router.put('/admin/:id/status', [
    verifyAdminToken,
    check("status", "Status is required").isIn(['pending', 'confirmed', 'cancelled'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = req.body.status;
        await booking.save();

        res.json(booking);
    } catch (err) {
        e_logger.error(`Admin update booking status error: ${err}`);
        res.status(500).json({ message: "Error updating booking status" });
    }
});

// Delete booking (admin only)
router.delete('/admin/:id', verifyAdminToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        e_logger.error(`Admin delete booking error: ${err}`);
        res.status(500).json({ message: "Error deleting booking" });
    }
});

module.exports = router; 