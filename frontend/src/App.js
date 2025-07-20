import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Signup from './Signup';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import Friends from './Friends';
import axios from 'axios';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactComponent as Logo } from './logo.svg';

const UserContext = createContext();

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { setUserData } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginRes = await axios.post('/users/login', formData);
      setUserData({
        token: loginRes.data.token,
        user: loginRes.data.user,
      });
      localStorage.setItem('auth-token', loginRes.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="email"
              id="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="password"
              id="password"
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            type="submit"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  });
  const location = useLocation();

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Signup />
              </motion.div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard />
              </motion.div>
            }
          />
          <Route
            path="/admin"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AdminDashboard />
              </motion.div>
            }
          />
          <Route
            path="/friends"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Friends />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </UserContext.Provider>
  );
}

export default AppWrapper;
