"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/app/userStore/userStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, message } = useUserStore();

  const person = {
    firstname: firstName,
    lastname: lastName,
    username: username,
    password: password,
  };

  useEffect(() => {
    if (message) {
      if (message === "Username already exist.") {
        toast.error(message);
      } else {
        toast.success(message);
      }
    }
  }, [message]);

  const handelSignUp = async (e) => {
    e.preventDefault();
    await signUp(person);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter your first name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter your last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="username"
              className="input input-bordered w-full"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input input-bordered w-full"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-4">
            <button onClick={handelSignUp} className="btn btn-primary w-full">
              Sign Up
            </button>
          </div>
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
