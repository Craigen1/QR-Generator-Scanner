"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const UsersPanel = (p) => {
  const [allUser, setAllUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const getAllUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/getAllUser", {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setAllUser(response.data);
      } catch (err) {
        console.log("Error GET ALL", err);
      }
    };
    getAllUser();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/deleteUser/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      setAllUser((p) => p.filter((userId) => userId.user_Id !== id));
    } catch (err) {
      console.log("Err del users:", err);
    }
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModuleSelection = (moduleId) => {
    p.setUserModules((prevModules) =>
      prevModules.map((module) =>
        module.id === moduleId ? { ...module, access: !module.access } : module
      )
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Users Panel</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fullname</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUser.map((user) => (
              <tr key={user.user_Id}>
                <td>{user.user_Id}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.userName}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      className="btn bg-emerald-500 btn-xs"
                      onClick={() => handleViewClick(user)}
                    >
                      View
                    </button>
                    <button className="btn btn-primary btn-xs">Edit</button>
                    <button
                      onClick={() => handleDelete(user.user_Id)}
                      className="btn btn-error btn-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Viewing User */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Access Control</h2>
            {selectedUser && (
              <div>
                <p className="mb-2">
                  User: {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <h3 className="text-lg font-semibold mb-2">Modules:</h3>
                <div className="space-y-2">
                  {p.userModules.map((module) => (
                    <div key={module.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={module.access}
                        onChange={() => handleModuleSelection(module.id)}
                        className="mr-2"
                      />
                      <label>{module.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition mx-1"
              onClick={handleModalClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
