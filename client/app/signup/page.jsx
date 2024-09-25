"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const signup = () => {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handelSignUp = async (e) => {
    e.preventDefault();
    const person = {
      fullname: fullname,
      email: email,
      password: password,
    };
    console.log(person);
    try {
      await axios.post("http://localhost:8080/signup", person);
      router.push("/");
    } catch (err) {
      console.log(`Error SignUp yan kala mo: ${err}`);
    }
  };

  const router = useRouter();

  const handleSignInRedirect = () => {
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="input input-bordered w-full"
              placeholder="Enter your email"
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
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={handleSignInRedirect} // Redirect when clicked
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default signup;
