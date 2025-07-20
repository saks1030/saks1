import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './App';

function Friends() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const { userData } = useContext(UserContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const usersRes = await axios.get('/admin/users', {
          headers: { 'x-auth-token': userData.token },
        });
        setUsers(usersRes.data);

        const userRes = await axios.get(`/users/${userData.user.id}`, {
          headers: { 'x-auth-token': userData.token },
        });
        setFriends(userRes.data.friends);
        setFriendRequests(userRes.data.friendRequests);
      } catch (err) {
        console.error(err);
      }
    };
    if (userData.token) {
      getData();
    }
  }, [userData.token]);

  const handleAddFriend = async (id) => {
    try {
      await axios.post(`/friends/add/${id}`, {}, {
        headers: { 'x-auth-token': userData.token },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptFriend = async (id) => {
    try {
      await axios.post(`/friends/accept/${id}`, {}, {
        headers: { 'x-auth-token': userData.token },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">All Users</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {users.map((user) => (
              <div key={user._id} className="flex justify-between items-center mb-2">
                <p>{user.username}</p>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded-lg"
                  onClick={() => handleAddFriend(user._id)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Friends</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {friends.map((friend) => (
              <div key={friend._id} className="flex justify-between items-center mb-2">
                <p>{friend.username}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {friendRequests.map((request) => (
              <div key={request._id} className="flex justify-between items-center mb-2">
                <p>{request.username}</p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg"
                  onClick={() => handleAcceptFriend(request._id)}
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;
