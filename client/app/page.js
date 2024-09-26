"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    const userCredentials = {
      email,
      password,
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/signin",
        userCredentials,
        {
          withCredentials: true,
        }
      );
      if (
        response.data.user.userEmail === email &&
        response.data.user.userPass === password
      ) {
        router.push("/components/dashboard");
      }
    } catch (err) {
      setMessage("Invalid Credentials");
      console.log(`Error Login: ${err}`);
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
          <form>
            {message ? (
              <p className="bg-red-400/80 p-2 rounded-md text-center text-white mb-2">
                {message}
              </p>
            ) : (
              ""
            )}

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
              <button onClick={handleSignIn} className="btn btn-primary w-full">
                Sign In
              </button>
            </div>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link
                href="/components/signup"
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
