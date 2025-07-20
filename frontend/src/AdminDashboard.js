import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './App';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [servers, setServers] = useState([]);
  const { userData } = useContext(UserContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const usersRes = await axios.get('/admin/users', {
          headers: { 'x-auth-token': userData.token },
        });
        setUsers(usersRes.data);

        const serversRes = await axios.get('/admin/servers', {
          headers: { 'x-auth-token': userData.token },
        });
        setServers(serversRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userData.token) {
      getData();
    }
  }, [userData.token]);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {users.map((user) => (
              <div key={user._id} className="flex justify-between items-center mb-2">
                <p>{user.username}</p>
                <p>{user.email}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Servers</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {servers.map((server) => (
              <div key={server._id} className="flex justify-between items-center mb-2">
                <p>{server.server_name}</p>
                <p>{server.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
