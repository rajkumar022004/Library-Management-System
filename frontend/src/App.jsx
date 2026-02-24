import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';


import { AuthProvider } from './context/AuthContext';


import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';


import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import UserHome from './pages/UserHome';
import BookIssue from './pages/BookIssue';
import BookReturn from './pages/BookReturn';
import BookAvailable from './pages/BookAvailable';
import PayFine from './pages/PayFine';
import AddMembership from './pages/AddMembership';
import UpdateMembership from './pages/UpdateMembership';
import AddBook from './pages/AddBook';
import UpdateBook from './pages/UpdateBook';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Chart from './pages/Chart';
import Confirmation from './pages/Confirmation';
import Logout from './pages/Logout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/chart" element={<Chart />} />
          
          {/* Protected Routes */}
          <Route path="/admin-home" element={
            <PrivateRoute>
              <AdminHome />
            </PrivateRoute>
          } />
          <Route path="/user-home" element={
            <PrivateRoute>
              <UserHome />
            </PrivateRoute>
          } />
          
          {/* Transaction Routes */}
          <Route path="/book-available" element={
            <PrivateRoute>
              <BookAvailable />
            </PrivateRoute>
          } />
          <Route path="/book-issue" element={
            <PrivateRoute>
              <BookIssue />
            </PrivateRoute>
          } />
          <Route path="/return-book" element={
            <PrivateRoute>
              <BookReturn />
            </PrivateRoute>
          } />
          <Route path="/pay-fine" element={
            <PrivateRoute>
              <PayFine />
            </PrivateRoute>
          } />
          
          {/* Maintenance Routes */}
          <Route path="/add-membership" element={
            <PrivateRoute adminOnly>
              <AddMembership />
            </PrivateRoute>
          } />
          <Route path="/update-membership" element={
            <PrivateRoute adminOnly>
              <UpdateMembership />
            </PrivateRoute>
          } />
          <Route path="/add-book" element={
            <PrivateRoute adminOnly>
              <AddBook />
            </PrivateRoute>
          } />
          <Route path="/update-book" element={
            <PrivateRoute adminOnly>
              <UpdateBook />
            </PrivateRoute>
          } />
          <Route path="/user-management" element={
            <PrivateRoute adminOnly>
              <UserManagement />
            </PrivateRoute>
          } />
          
          {/* Report Routes */}
          <Route path="/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />
          
          {/* Status Routes */}
          <Route path="/confirmation" element={
            <PrivateRoute>
              <Confirmation />
            </PrivateRoute>
          } />
          <Route path="/logout" element={<Logout />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;