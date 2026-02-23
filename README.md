# Library Management System

A comprehensive digital solution for managing library operations, including book inventory, member management, lending, and reservations.

## 📋 Overview

The Library Management System is designed to streamline library operations by automating book management, member registration, borrowing and returning books, and tracking library resources. This system provides an efficient way for librarians to manage their collections and for members to access library services.

## ✨ Features

- **Book Management**: Add, update, and delete books with detailed information
- **Member Management**: Register members, manage profiles, and track membership status
- **Borrowing System**: Easy check-out and check-in of books with automatic due date tracking
- **Search & Filter**: Advanced search capabilities to find books by title, author, ISBN, or category
- **Reservation System**: Members can reserve books currently checked out
- **Fine Management**: Automatic calculation and tracking of late fees
- **Reports & Analytics**: Generate reports on circulation, member activity, and inventory
- **User Authentication**: Secure login system for librarians and members
- **Notification System**: Automated reminders for due dates and reservations

## 🛠️ Tech Stack

- **Backend**: Node.js / Express.js
- **Frontend**: React.js / HTML5 / CSS3
- **Database**: MongoDB / MySQL
- **Authentication**: JWT
- **API**: RESTful API

## 📦 Project Structure

```
Library-Management-System/
├── backend/           # Backend server code
├── frontend/          # Frontend application
├── database/          # Database schema and migrations
├── docs/              # Documentation
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB or MySQL
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajkumar022004/Library-Management-System.git
   cd Library-Management-System
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   - Create `.env` file in the backend directory
   - Add necessary configuration variables

5. **Run the application**
   ```bash
   # Terminal 1: Start backend server
   cd backend
   npm start

   # Terminal 2: Start frontend application
   cd frontend
   npm start
   ```

## 📖 API Documentation

The API follows RESTful principles. Key endpoints include:

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Register new member
- `PUT /api/members/:id` - Update member profile
- `DELETE /api/members/:id` - Remove member

### Borrowing
- `POST /api/borrow` - Check out a book
- `POST /api/return` - Return a book
- `GET /api/borrow/history/:memberId` - Get member's borrowing history

### Reservations
- `POST /api/reserve` - Reserve a book
- `DELETE /api/reserve/:reservationId` - Cancel reservation

## 🔐 Authentication

The system uses JWT (JSON Web Token) for authentication. Members and librarians must log in to access their respective features.

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🗄️ Database Schema

### Books Table
- book_id (Primary Key)
- title
- author
- isbn
- category
- publisher
- publication_date
- total_copies
- available_copies
- status

### Members Table
- member_id (Primary Key)
- name
- email
- phone
- membership_date
- membership_status
- address

### Borrowing Table
- borrow_id (Primary Key)
- member_id (Foreign Key)
- book_id (Foreign Key)
- borrow_date
- due_date
- return_date
- fine_amount

## 📝 Usage Examples

### Adding a Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "category": "Fiction",
    "copies": 5
  }'
```

### Borrowing a Book
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "M001",
    "bookId": "B001"
  }'
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Rajkumar** - Initial work and development

## 📧 Contact & Support

For support, email us at [your-email@example.com] or open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Special thanks to the open-source community for the libraries and tools used

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React.js Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)

---

**Last Updated**: 2026-02-23 21:15:07