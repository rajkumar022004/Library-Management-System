const Book = require('../models/Book');


exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort('-createdAt');
    res.json({
      success: true,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAvailableBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'AVAILABLE' });
    res.json({
      success: true,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.searchBooks = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    const books = await Book.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { author: { $regex: keyword, $options: 'i' } },
        { serialNo: { $regex: keyword, $options: 'i' } }
      ]
    });
    
    res.json({
      success: true,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getBookBySerialNo = async (req, res) => {
  try {
    const book = await Book.findOne({ serialNo: req.params.serialNo });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.json({
      success: true,
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.addBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    
    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};