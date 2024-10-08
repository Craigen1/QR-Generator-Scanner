import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useUserStore } from "../userStore/userStore";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const { allModules, getAllModules, setActivePanel } = useUserStore();

  useEffect(() => {
    getAllModules();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSetActive = (code) => {
    setActivePanel(code);
    setActiveCode(code);
  };

  return (
    <div>
      {/* Mobile Menu Icon */}
      <div className="lg:hidden flex justify-end p-4">
        <button onClick={handleToggle}>
          {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full bg-gray-100 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64 w-64 shadow-lg p-4 z-50`}
      >
        <Link href="#">
          <h2 className="text-2xl font-bold mb-6 cursor-pointer text-gray-800">
            Menu
          </h2>
        </Link>

        <ul className="space-y-2">
          {allModules.map((items) => (
            <li key={items.mod_id} className="mb-2">
              {items.mod_addModule && (
                <button
                  onClick={() => handleSetActive(items.mod_active)}
                  className={`w-full p-2 rounded-lg text-left transition-colors ${
                    activeCode === items.mod_active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                  }`}
                >
                  {items.mod_name}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          onClick={handleToggle}
          className="fixed inset-0 bg-black opacity-50 lg:hidden"
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
