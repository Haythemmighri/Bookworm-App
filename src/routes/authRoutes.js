import express from 'express';
import jwt from 'jsonwebtoken'; 
import User from '../models/User.js'; 

const router = express.Router();

// ✅ Token generator function
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

// ✅ Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long!' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long!' });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists!' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    // ✅ Generate random avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // ✅ Create user
    const newUser = new User({
      username,
      email,
      password, // You should hash this for security
      profileImage
    });

    await newUser.save();

    // ✅ Generate JWT token
    const token = generateToken(newUser._id);

    // ✅ Send response
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImage: newUser.profileImage
      }
    });

  } catch (error) {
    console.error("Error in register route:", error);
    res.status(500).json({ message: 'Internal Server error!' });
  }
});

// ✅ Dummy login route
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({ message: 'All fields are required!' });
        
        // check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User does not exist!' });

        //check if password is match
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials!' });
        // generate token
        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });       
    } catch (error) {
        console.error("Error in login route:", error);
        res.status(500).json({ message: 'Internal Server error!' });   
    }
});

export default router;
 