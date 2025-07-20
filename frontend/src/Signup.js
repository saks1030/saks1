import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactComponent as Logo } from './logo.svg';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users/register', formData);
      navigate('/');
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
        <h1 className="text-3xl font-bold text-center text-purple-400 mb-8">Create an Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="text"
              id="username"
              placeholder="Choose a username"
              onChange={handleChange}
            />
          </div>
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
              placeholder="Create a password"
              onChange={handleChange}
            />
          </div>
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            type="submit"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
