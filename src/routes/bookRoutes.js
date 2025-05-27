import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Books.js';
import protectRoute from '../middleware/auth.middleware.js'; 

const router = express.Router();

router.post('/',protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        // Basic validation
        if (!image || !title || !rating || !caption) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            user: req.user._id,
            image: imageUrl
        });

        await newBook.save();
        res.status(201).json({newBook});
    } catch (error) {
        console.error("Error in creating book:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/', protectRoute, async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalBooks = await Book.countDocuments();
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profileImage');
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });
    } catch (error) {
        console.error("Error in fetching books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error("get user books error:", error);
        res.status(500).json({ message: 'server error' });
    }
});

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        //check if user is the creator of the book 
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        //delete image from cloudinary as well
        if (book.image && book.image.includes('cloudinary')) {
            
        try {
            const publicId = book.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
            console.error("Error in deleting image from cloudinary:", deleteError);
        }
        }

        await book.deleteOne();

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error("Error in deleting book:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;