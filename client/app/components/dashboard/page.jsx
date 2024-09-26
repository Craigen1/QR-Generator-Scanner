"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import QRCodeGenerator from "../qrcode/QRCode";
import CopyFromExcel from "../copyfromexcel/CopyFromExcel";
import Sidebar from "../Sidebar";

const page = () => {
  const [user, setUser] = useState("");
  const [activePanel, setActivePanel] = useState("qrcode");
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
      console.log("Error logout:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar setActivePanel={setActivePanel} />
      <div className="flex-grow p-6">
        <div className="flex justify-end">
          <button onClick={logoutUser} className="underline">
            Logout
          </button>
        </div>
        {user ? (
          <h3 className="text-2xl ">
            Hello <span className="font-bold text-sky-500">{user}</span>
          </h3>
        ) : (
          <p>No user is logged in.</p>
        )}

        {activePanel === "qrcode" && <QRCodeGenerator />}
        {activePanel === "excel" && <CopyFromExcel />}
        {activePanel === "users" && <div>Users Panel Component</div>}
      </div>
    </div>
  );
};

export default page;
