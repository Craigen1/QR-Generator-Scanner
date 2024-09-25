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
      <div className="w-64 h-screen bg-base-200 p-4">
        <Link href="">
          {" "}
          <h2 className="text-2xl font-bold mb-6 cursor-pointer">Menu</h2>
        </Link>
        <ul className="menu menu-compact">
          {sideBar.map((items) => (
            <div key={items.id}>
              <li className="text-lg cursor-pointer my-1">
                <button onClick={() => setActivePanel(items.code)}>
                  {items.name}
                </button>
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
