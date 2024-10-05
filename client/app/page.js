"use client";
import Link from "next/link";
import { useUserStore } from "./userStore/userStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { handleSignIn, setPassword, setUsername, message } = useUserStore();
  const Login = async (e) => {
    e.preventDefault();
    await handleSignIn(router);
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
              <button onClick={Login} className="btn btn-primary w-full">
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
