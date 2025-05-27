import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        // Check if header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        // Verify the token using your secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        // Attach user to the request object
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default protectRoute;
