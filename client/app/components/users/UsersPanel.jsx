import { useUserStore } from "@/app/userStore/userStore";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // Assuming you have installed react-toastify
import "react-toastify/dist/ReactToastify.css";

const UsersPanel = () => {
  const [allUser, setAllUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const {
    getAllModules,
    updateModList,
    handleChange,
    deleteModule,
    modulePerUser,
    getModulePerUser,
    user,
  } = useUserStore();
  console.log(user);

  //GET All Modules
  useEffect(() => {
    getAllModules();
  }, []);

  //GET Module Per User
  useEffect(() => {
    getModulePerUser();
  }, []);

  //GET All Users
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
        console.log("Error GET ALL User", err);
      }
    };
    getAllUser();
  }, []);

  // DELETE User with confirmation
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/deleteUser/${id}`, {
        withCredentials: true,
      });
      setAllUser((p) => p.filter((userId) => userId.user_Id !== id));
      toast.success("User deleted successfully!");
    } catch (err) {
      console.log("Err del users:", err);
      toast.error("Failed to delete user.");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      handleDelete(selectedUser.user_Id);
    }
    setIsDeleteModalOpen(false);
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    await updateModList();
  };

  return (
    <div className="p-6">
      <form onSubmit={handleRefresh}>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold mb-4">Users Panel</h1>
          <button type="submit" className="btn btn-sm btn-outline">
            ⟳ Update List
          </button>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Active</th>
              <th>Fullname</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUser.map((user) => (
              <tr key={user.user_Id}>
                <td>{user.user_Id} </td>
                <td className="h-2 w-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user === user.user_Id ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </td>
                <td className={user === user.user_Id ? "text-green-500" : ""}>
                  {user.firstName} {user.lastName}
                </td>
                <td className={user === user.user_Id ? "text-green-500" : ""}>
                  {user.userName}
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      className="btn bg-emerald-500 hover:bg-emerald-600 btn-xs"
                      onClick={() => handleViewClick(user)}
                    >
                      View
                    </button>
                    <button className="btn bg-blue-500 hover:bg-blue-600 btn-xs">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
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
                <div>
                  <p className="mb-2">
                    User: {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                <h3 className="text-lg font-semibold mb-2">Modules:</h3>
                <div className="space-y-2">
                  {modulePerUser.map(
                    (module) =>
                      selectedUser.user_Id === module.user_Id && (
                        <div
                          key={module.mod_id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <input
                              type="checkbox"
                              checked={module.mod_addModule}
                              onChange={() =>
                                handleChange(
                                  module.mod_id,
                                  selectedUser.user_Id
                                )
                              }
                              className="mr-2"
                            />
                            <label>{module.mod_name}</label>
                          </div>
                          <button
                            onClick={() => deleteModule(module.mod_id)}
                            className="btn btn-error btn-sm text-white"
                          >
                            🗑
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-5 mt-4">
              <button
                className="btn btn-sm btn-error hover:bg-red-700 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm btn-error hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Confirm
              </button>
              <button
                className="btn btn-sm btn-secondary ml-2"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default UsersPanel;
