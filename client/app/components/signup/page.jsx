"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

const signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const person = {
    firstname: firstName,
    lastname: lastName,
    username: username,
    password: password,
  };

  const handelSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/signup", person);
      setMessage(res.data.message);
      console.log(message);
    } catch (err) {
      console.log(`Error SignUp yan kala mo: ${err}`);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        {message ? (
          <p
            className={`p-2 rounded-md text-center text-white mb-2 ${
              message === "Username already exist."
                ? "bg-red-400/80"
                : "bg-green-400/80 "
            }`}
          >
            {message}
          </p>
        ) : (
          ""
        )}
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter your full name"
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
              placeholder="Enter your full name"
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
    </div>
  );
};

export default signup;
