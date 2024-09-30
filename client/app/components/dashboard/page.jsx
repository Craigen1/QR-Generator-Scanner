"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import QRCodeGenerator from "../qrcode/QRCode";
import CopyFromExcel from "../copyfromexcel/CopyFromExcel";
import Sidebar from "../Sidebar";
import UsersPanel from "../users/UsersPanel";

const Page = () => {
  const [userModules, setUserModules] = useState([
    {
      id: 1,
      name: "QR Code Generator",
      code: "qrcode",
      access: false,
    },
    {
      id: 2,
      name: "Paste from Excel",
      code: "excel",
      access: false,
    },
    {
      id: 3,
      name: "Users",
      code: "users",
      access: true,
    },
  ]);
  const [user, setUser] = useState("");
  const [activePanel, setActivePanel] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/getUser", {
          withCredentials: true,
        });
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        router.push("/");
        console.log(err);
      }
    };
    userAuth();
  }, []);

  const logoutUser = async () => {
    router.push("/");
    try {
      await axios.post(
        "http://localhost:8080/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setUser("");
    } catch (err) {
      console.log("Error logging out:", err);
    }
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar userModules={userModules} setActivePanel={setActivePanel} />
      <div className="flex-grow p-6">
        <div className="flex justify-end mb-4">
          <button onClick={logoutUser} className="btn btn-outline btn-error">
            Logout
          </button>
        </div>

        {user ? (
          <h3 className="text-2xl">
            Hello, <span className="font-bold text-blue-500">{user}</span>
          </h3>
        ) : (
          <p>No user is logged in.</p>
        )}
        <div className="mt-6">
          {activePanel === "qrcode" && <QRCodeGenerator />}
          {activePanel === "excel" && <CopyFromExcel />}
          {activePanel === "users" && (
            <UsersPanel
              userModules={userModules}
              setUserModules={setUserModules}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
