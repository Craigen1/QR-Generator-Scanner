"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import QRCodeGenerator from "../qrcode/QRCode";
import CopyFromExcel from "../copyfromexcel/CopyFromExcel";
import Sidebar from "../Sidebar";
import UsersPanel from "../users/UsersPanel";
import { useUserStore } from "@/app/userStore/userStore";
import GetItems from "../getitem/GetItems";

const Page = () => {
  const { activePanel, user, logoutUser, userAuth } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const uAuth = async () => {
      await userAuth(router);
    };
    uAuth;
  }, []);

  const logout = async () => {
    await logoutUser(router);
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <div className="flex-grow p-6">
        <div className="flex justify-between">
          {user ? (
            <h3 className="text-2xl">
              Hello, <span className="font-bold text-blue-500">{user}</span>
            </h3>
          ) : (
            <p>No user is logged in.</p>
          )}
          <button onClick={logout} className="btn btn-outline btn-error btn-sm">
            Logout
          </button>
        </div>
        <div className="mt-6">
          {activePanel === "qrcode" && <QRCodeGenerator />}
          {activePanel === "excel" && <CopyFromExcel />}
          {activePanel === "getitem" && <GetItems />}
          {activePanel === "users" && <UsersPanel />}
        </div>
      </div>
    </div>
  );
};

export default Page;
