import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/auth/home", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        setUser(response.data.user); // Set user details
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
      console.log(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/login"); // Redirect to login
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-3xl text-blue-500 mb-4">Welcome</h1>
      {user ? (
        <div>
          <p className="text-lg">Username: {user.username}</p>
          <p className="text-lg">Email: {user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Home;
