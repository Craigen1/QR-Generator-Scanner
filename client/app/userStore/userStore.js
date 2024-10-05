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
      id: 4,
      mod_name: "Get Item",
      mod_active: "getitem",
      mod_addModule: false,
    },
    {
      id: 5,
      mod_name: "Test",
      mod_active: "test",
      mod_addModule: false,
    },
    {
      id: 3,
      mod_name: "Users",
      mod_active: "users",
      mod_addModule: false,
    },
  ],
  message: "",
  allModules: [],
  modulePerUser: [],
  activePanel: "/",
  searchTerm: null,
  Items: {},
  UserSession: null,
  uUsername: "",
  pPassword: "",
  user: "",

  // Functions
  //deleteModule
  deleteModule: async (id) => {
    const { allModules, modulePerUser } = get();
    const delSidebar = allModules.filter((mod) => mod.mod_id !== id);
    const delViewModal = modulePerUser.filter((mod) => mod.mod_id !== id);
    set({ allModules: delSidebar });
    set({ modulePerUser: delViewModal });
    try {
      await axios.delete(
        `http://localhost:8080/deleteModule/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log("DELETE Module", err);
    }
  },

  //signUp
  signUp: async (person) => {
    const { localUsersModule } = get();
    let signupResponse = await axios.post(
      "http://localhost:8080/signup",
      { person, localUsersModule },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    set({ message: signupResponse.data.message });
    console.log(signupResponse.data.message);
  },

  //getModulePerUser or SELECT all modules from usersModule
  getModulePerUser: async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/getModulePerUser",
        {
          withCredentials: true,
        }
      );
      set({ modulePerUser: response.data });
    } catch (err) {
      console.log("Error GET ALL Modules", err);
    }
  },

  //getAllModules
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

  //AddModList if Manual
  updateModList: async () => {
    const { localUsersModule } = get();
    await axios.post("http://localhost:8080/addmodule", localUsersModule, {
      withCredentials: true,
    });
  },

  //Update the state of mod_addModule to 0 if unchecked and 1 if checked
  handleChange: async (mod_id, user_Id) => {
    const { modulePerUser } = get();

    const updatedModules = modulePerUser.map((mod) =>
      mod.mod_id === mod_id && mod.user_Id === user_Id
        ? { ...mod, mod_addModule: !mod.mod_addModule }
        : mod
    );
    set({ modulePerUser: updatedModules });
    try {
      await axios.put(
        `http://localhost:8080/updateModules/${mod_id}`,
        updatedModules,
        {
          withCredentials: true,
        }
      );
      console.log(mod_id);
      console.log(user_Id);
    } catch (err) {
      console.error("Error updating module:", err);
    }
  },

  //Signin Account
  handleSignIn: async (router) => {
    const { uUsername, pPassword } = get();
    const userCredentials = {
      uUsername,
      pPassword,
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/signin",
        userCredentials,
        {
          withCredentials: true,
        }
      );
      const user = response.data.user;
      set({ UserSession: user.user_Id });
      if (
        response.data.user.userName === uUsername &&
        response.data.user.userPass === pPassword
      ) {
        router.push("/components/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      set({ message: "Invalid Credentials" });
      console.log("Error Login:", err);
    }
  },

  userAuth: async (router) => {
    try {
      const res = await axios.get("http://localhost:8080/getUser", {
        withCredentials: true,
      });
      if (res.data) {
        set({ user: res.data });
      } else {
        router.push("/");
      }
    } catch (err) {
      router.push("/");
      console.log(err);
    }
  },

  logoutUser: async (router) => {
    router.push("/");
    try {
      await axios.post(
        "http://localhost:8080/logout",
        {},
        {
          withCredentials: true,
        }
      );
      set({ user: "" });
      set({ activePanel: "/" });
    } catch (err) {
      console.log("Error logging out:", err);
    }
  },

  setUsername: (p) => {
    set({ uUsername: p });
  },

  setPassword: (p) => {
    set({ pPassword: p });
  },

  //setActivePanel
  setActivePanel: (p) => {
    set({ activePanel: p });
  },

  //Logout SAP B1 Service Layer
  logoutToSapB1: async () => {
    try {
      await axios.post("http://localhost:8080/api/logout"),
        { withCredentials: true };
      console.log("Successfully logged out");
    } catch (err) {
      console.error("Logout failed", err);
    }
  },
  //Login SAP B1 Service Layer
  loginToSapB1: async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/login",
        {
          UserName: "IPICPADM03",
          Password: "!Pic030122",
          CompanyDB: "PROD",
        },
        { withCredentials: true }
      );
      console.log("Session UserStoreLogin:", response.data.SessionId);
    } catch (err) {
      console.log("Error Login UserStore:", err);
    }
  },
  setSearchTerm: (itemcode) => set({ searchTerm: itemcode }),

  //Search Item Code with SAP B1 Service Layer
  search: async () => {
    const { logoutToSapB1, searchTerm } = get();
    console.log("Search:", searchTerm);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/items/${searchTerm}`,
        {
          withCredentials: true,
        }
      );
      console.log("Items:", response.data);
      set({ Items: response.data });
      // await logoutToSapB1();
    } catch (err) {
      console.log("Error Search Item:", err);
    }
  },
}));
