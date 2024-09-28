import Link from "next/link";
import React from "react";

const Sidebar = ({ setActivePanel }) => {
  const sideBar = [
    {
      id: 1,
      name: "QR Code Generator",
      code: "qrcode",
    },
    {
      id: 2,
      name: "Paste from Excel",
      code: "excel",
    },
    {
      id: 3,
      name: "Users",
      code: "users",
    },
  ];

  return (
    <div className="flex">
      <div className="w-64 h-screen bg-base-200 p-4 shadow-lg">
        <Link href="">
          <h2 className="text-2xl font-bold mb-6 cursor-pointer text-primary">
            Menu
          </h2>
        </Link>
        <ul className="menu p-0">
          {sideBar.map((items) => (
            <li key={items.id} className="mb-2">
              <button
                className="btn btn-outline btn-primary w-full text-left"
                onClick={() => setActivePanel(items.code)}
              >
                {items.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
