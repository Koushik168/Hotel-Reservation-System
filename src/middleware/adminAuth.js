const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin');

const verifyAdminToken = async (req, res, next) => {
    const token = req.cookies["admin_auth_token"];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if the user is an admin
        const admin = await AdminModel.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({ message: "Unauthorized: Admin not found" });
        }

        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid admin token" });
    }
};

module.exports = verifyAdminToken; 