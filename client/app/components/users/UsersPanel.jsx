"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const UsersPanel = () => {
  const [allUser, setAllUser] = useState([]);
  useEffect(() => {
    const getAllUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/getAllUser",
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
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
        { withCredentials: true }
      );
      setAllUser((p) => p.filter((userId) => userId.user_Id !== id));
    } catch (err) {
      console.log("Err del users:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Users Panel</h1>

      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* Table header */}
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUser.map((user) => (
              <tr key={user.user_Id}>
                <td>{user.user_Id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.userName}</td>
                <td>
                  <div className="flex space-x-2">
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
    </div>
  );
};

export default UsersPanel;
