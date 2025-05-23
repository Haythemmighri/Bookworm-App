import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {

    /* const response = await fetch("https://localhost:3000/api/books", {
        method: "POST",
        body: JSON.stringify({
            title,
            caption
        }),
        headers: { Authorization: `Bearer ${token}`}
    }); */

    try {
        // get token 
        const token = req.headers("authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const user  = await User.findById(decoded.userId).select("-password");

        if (!user) return res.status(401).json({ message: "Token is not valid" });

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Token in not valid" });
    }
}

export default protectRoute;