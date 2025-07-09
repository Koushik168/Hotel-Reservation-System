require('dotenv').config();
const mongoose = require('mongoose');
const AdminModel = require('./src/models/admin');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_CONNECTION);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email: 'admin@example.com' });

        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            // Create admin user
            const admin = new AdminModel({
                email: 'admin@example.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            });

            await admin.save();
            console.log('Admin user created successfully');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin(); 