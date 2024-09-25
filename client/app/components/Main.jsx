"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CopyFromExcel from "./CopyFromExcel";
import QRCodeGenerator from "./QRCode";
import axios from "axios";

const Main = () => {
  const [user, setUser] = useState("");
  const [activePanel, setActivePanel] = useState("qrcode");
  useEffect(() => {
    axios
      .get("http://localhost:8080/getUser", {
        withCredentials: true, // Ensures cookies are sent with the request
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error trying to get user:", err));
  }, []);

  return (
    <div className="flex">
      <Sidebar setActivePanel={setActivePanel} />
      <div className="flex-grow p-6">
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

export default Main;
