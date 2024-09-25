"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import QRCodeGenerator from "./components/QRCode";
import Main from "./components/Main";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    const userCredentials = {
      email,
      password,
    };
    try {
      const res = await axios.post(
        "http://localhost:8080/signin",
        userCredentials
      );
      if (res.status === 200) {
        setIsLogin(true);
      }
    } catch (err) {
      console.log(`Error Login: ${err}`);
    }
  };

  const handleSignUpRedirect = () => {
    router.push("/signup");
  };
  return (
    <div>
      {!isLogin ? (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
            <form>
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
                <button
                  onClick={handleSignIn}
                  className="btn btn-primary w-full"
                >
                  Sign In
                </button>
              </div>
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={handleSignUpRedirect} // Redirect when clicked
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <Main />
      )}
    </div>
  );
}
