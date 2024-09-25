"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CopyFromExcel from "./CopyFromExcel";
import QRCodeGenerator from "./QRCode";
import axios from "axios";

const Main = () => {
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("qrcode");

  console.log(user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/getUser", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error trying to get user:", error);
      }
    };
    getUser();
  }, []);

  return (
    <div className="flex">
      <Sidebar setActivePanel={setActivePanel} />
      <div className="flex-grow p-6">
        {user ? <h3>Hello {user.fullname}</h3> : <p>No user is logged in.</p>}
        {activePanel === "qrcode" && <QRCodeGenerator />}
        {activePanel === "excel" && <CopyFromExcel />}
        {activePanel === "users" && <div>Users Panel Component</div>}
      </div>
    </div>
  );
};

export default Main;
