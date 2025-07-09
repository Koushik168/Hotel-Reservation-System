const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, default: 'admin' }
}, {
    timestamps: true,
    versionKey: false
});

adminSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel; 