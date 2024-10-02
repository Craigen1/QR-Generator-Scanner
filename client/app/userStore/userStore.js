import { create } from "zustand";
import axios from "axios";

export const useUserStore = create((set, get) => ({
  //States
  localUsersModule: [
    //dapat di same ng mod_name
    {
      id: 1,
      mod_name: "QR Code Generator",
      mod_active: "qrcode",
      mod_addModule: false,
    },
    {
      id: 2,
      mod_name: "Paste from Excel",
      mod_active: "excel",
      mod_addModule: false,
    },
    {
      id: 3,
      mod_name: "Users",
      mod_active: "users",
      mod_addModule: true,
    },
  ],
  allModules: [],
  activePanel: "/",

  //Functions
  deleteModule: async (id) => {
    const { allModules } = get();
    const del = allModules.filter((mod) => mod.mod_id !== id);
    set({ allModules: del });
    try {
      await axios.delete(`http://localhost:8080/deleteModule/${id}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.log("DELETE Module", err);
    }
  },
  getAllModules: async () => {
    try {
      const response = await axios.get("http://localhost:8080/getAllModules", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      set({ allModules: response.data });
    } catch (err) {
      console.log("Error GET ALL Modules", err);
    }
  },
  updateModList: async () => {
    const { localUsersModule } = get();
    await axios.post("http://localhost:8080/addmodule", localUsersModule, {
      withCredentials: true,
    });
  },
  //Update the state of mod_addModule to 0 if unchecked and 1 if checked
  handleChange: async (id) => {
    const { allModules } = get();
    const updatedModules = allModules.map((mod) =>
      mod.mod_id === id ? { ...mod, mod_addModule: !mod.mod_addModule } : mod
    );
    set({ allModules: updatedModules });
    console.log(updatedModules);
    await axios.put("http://localhost:8080/updateModules", updatedModules, {
      withCredentials: true,
    });
  },
  setActivePanel: (p) => {
    set({ activePanel: p });
  },
}));
