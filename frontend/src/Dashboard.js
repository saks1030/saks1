import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './App';
import { ReactComponent as Logo } from './logo.svg';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newServer, setNewServer] = useState({
    server_name: '',
    game_type: 'java',
    version: '1.21',
    ram: 1,
  });
  const { userData } = useContext(UserContext);

  useEffect(() => {
    const getServers = async () => {
      try {
        const res = await axios.get('/servers', {
          headers: { 'x-auth-token': userData.token },
        });
        setServers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userData.token) {
      getServers();
    }
  }, [userData.token]);

  const handleChange = (e) => {
    setNewServer({ ...newServer, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/servers/create', newServer, {
        headers: { 'x-auth-token': userData.token },
      });
      setServers([...servers, res.data]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <Logo />
        <nav>
          <Link to="/dashboard" className="text-gray-400 hover:text-white mr-4">
            {t('Servers')}
          </Link>
          <Link to="/friends" className="text-gray-400 hover:text-white mr-4">
            {t('Friends')}
          </Link>
          <a href="#" className="text-gray-400 hover:text-white mr-4">
            {t('Support')}
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            {t('Logout')}
          </a>
        </nav>
        <div>
          <button onClick={() => i18n.changeLanguage('en')}>English</button>
          <button onClick={() => i18n.changeLanguage('ar')}>العربية</button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-8">{t('Your Servers')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servers.map((server) => (
            <motion.div
              key={server._id}
              className="bg-gradient-to-br from-purple-900 to-gray-900 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-white mb-2">{server.server_name}</h3>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${
                      server.status === 'online' ? 'bg-green-400' : 'bg-red-500'
                    }`}
                  ></span>
                  <p className="text-sm text-gray-300 capitalize">{t(server.status)}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                {t(server.game_type.charAt(0).toUpperCase() + server.game_type.slice(1))} - {server.version}
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-400">{t('RAM')}</p>
                  <p className="text-white font-semibold">{server.ram} GB</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${(server.ram / 16) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between">
                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  {t('Manage')}
                </button>
                <button
                  className={`font-bold py-2 px-4 rounded-lg transition duration-300 ${
                    server.status === 'online'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  onClick={() => {
                    if (server.status === 'online') {
                      axios.post(`/servers/stop/${server._id}`, {}, { headers: { 'x-auth-token': userData.token } });
                    } else {
                      axios.post(`/servers/start/${server._id}`, {}, { headers: { 'x-auth-token': userData.token } });
                    }
                  }}
                >
                  {server.status === 'online' ? t('Stop') : t('Start')}
                </button>
              </div>
            </motion.div>
          ))}
          {/* Add New Server Card */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <button className="text-purple-400 text-5xl font-bold hover:text-purple-500 transition duration-300">
              +
            </button>
          </div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t('Create New Server')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="server_name">
                  {t('Server Name')}
                </label>
                <input
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  id="server_name"
                  placeholder={t('My Awesome Server')}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="game_type">
                  {t('Game Type')}
                </label>
                <select
                  id="game_type"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={handleChange}
                >
                  <option value="java">{t('Java')}</option>
                  <option value="bedrock">{t('Bedrock')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="version">
                  {t('Version')}
                </label>
                <input
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  id="version"
                  defaultValue="1.21"
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="ram">
                  {t('RAM (GB)')}
                </label>
                <input
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="number"
                  id="ram"
                  defaultValue="1"
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mr-2 transition duration-300"
                  onClick={() => setShowModal(false)}
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  {t('Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
