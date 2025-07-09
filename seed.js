require('dotenv').config();
const mongoose = require('mongoose');
const databaseConnection = require('./src/models/connection/database');
const User = require('./src/models/model');
const Hotel = require('./src/models/hotel');
const logger = require('./src/utils/info_logger');
const { e_logger } = require('./src/utils/error_logger');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION);
        logger.info('Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Hotel.deleteMany({});
        logger.info('Cleared existing users and hotels');

        // Create a user
        const user = new User({
            email: 'john.doe@example.com',
            password: 'password123', // Will be hashed by pre-save hook
            firstName: 'John',
            lastName: 'Doe',
        });
        await user.save();
        logger.info(`Created user: ${user.email}`);

        // Create hotels
        const hotels = [
            {
                userId: user._id.toString(),
                name: 'Grand Palace Hotel',
                city: 'New York',
                country: 'USA',
                description: 'A luxury hotel in the heart of New York.',
                type: 'Hotel',
                adultCount: 2,
                childCount: 2,
                facilities: ['WiFi', 'Pool', 'Gym', 'Spa'],
                pricePerNight: 250,
                starRating: 5,
                imageUrls: [
                    'https://example.com/images/hotel1-1.jpg',
                    'https://example.com/images/hotel1-2.jpg',
                ],
                lastUpdated: new Date(),
            },
            {
                userId: user._id.toString(),
                name: 'Seaside Resort',
                city: 'Miami',
                country: 'USA',
                description: 'Enjoy the beach and sun at Seaside Resort.',
                type: 'Resort',
                adultCount: 2,
                childCount: 1,
                facilities: ['WiFi', 'Beach Access', 'Bar'],
                pricePerNight: 180,
                starRating: 4,
                imageUrls: [
                    'https://example.com/images/hotel2-1.jpg',
                ],
                lastUpdated: new Date(),
            },
            {
                userId: user._id.toString(),
                name: 'Mountain Lodge',
                city: 'Denver',
                country: 'USA',
                description: 'A cozy lodge in the mountains.',
                type: 'Lodge',
                adultCount: 4,
                childCount: 0,
                facilities: ['WiFi', 'Fireplace', 'Hiking Trails'],
                pricePerNight: 120,
                starRating: 3,
                imageUrls: [
                    'https://example.com/images/hotel3-1.jpg',
                ],
                lastUpdated: new Date(),
            },
        ];

        await Hotel.insertMany(hotels);
        logger.info('Seeded hotels');
        logger.info('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        e_logger.error(err);
        logger.error('Seeding failed');
        process.exit(1);
    }
}

seed(); 