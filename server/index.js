const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const config = require("./dbFiles/dbConfig");
const QRCode = require("qrcode");
const session = require("express-session");
const crypto = require("crypto");
const fetch = require("node-fetch");
const https = require("https");
const axios = require("axios");

const port = 8080;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
// Set up session middleware
const sessionSecret = crypto.randomBytes(64).toString("hex");
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // maxAge: 1000 * 60 * 60,
    },
  })
);

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL certificate verification
});

//SAP LOGOUT
app.post("/api/logout", async (req, res) => {
  try {
    const SessionId = req.session.sessionId;
    await fetch("https://10.50.79.53:50000/b1s/v1/Logout", {
      method: "POST",
      agent: httpsAgent,
      headers: {
        Cookie: `B1SESSION=${SessionId}`,
      },
    });
    req.session.destroy(() => {
      res.status(200).send({ message: "Successfully logged out" });
    });
  } catch (err) {
    console.log("Error API Logout", err);
  }
});

//SAP LOGIN
app.post("/api/login", async (req, res) => {
  const { UserName, Password, CompanyDB } = req.body;
  try {
    const response = await fetch("https://10.50.79.53:50000/b1s/v1/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserName: UserName,
        Password: Password,
        CompanyDB: CompanyDB,
      }),
      agent: httpsAgent,
    });
    const data = await response.json();
    req.session.sessionId = data.SessionId;
    console.log("Login Response Data:", data);
    res.json({ SessionId: req.session.sessionId });
  } catch (error) {
    console.error("Login failed:", error);
    res
      .status(500)
      .json({ message: "Login failed", error: error.response.data });
  }
});

//SAP GET ITEMS
app.get("/api/items/:itemcode", async (req, res) => {
  const { itemcode } = req.params;
  console.log("ItemCode:", itemcode);
  try {
    const sessionId = req.session.sessionId;
    console.log("GET Session:", sessionId);
    const response = await fetch(
      `https://10.50.79.53:50000/b1s/v1/Items('${itemcode}')?
      $select=ItemCode,ItemName,ItemsGroupCode,SalesVATGroup,
      ItemType,UpdateDate,UpdateTime,U_APP_ItemSGroup`,
      {
        method: "GET",
        headers: {
          Cookie: `B1SESSION=${sessionId}`,
        },
        agent: httpsAgent,
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching items:", error);
    res
      .status(500)
      .json({ message: "Error fetching items", error: error.response.data });
  }
});

// SIGNUP Account
app.post("/signup", async (req, res) => {
  const { person, localUsersModule } = req.body;
  try {
    let pool = await sql.connect(config);
    let existingUserQuery = await pool
      .request()
      .input("userName", sql.NVarChar, person.username)
      .query(
        "SELECT COUNT(*) AS count FROM usersTbl WHERE userName = @userName"
      );

    if (existingUserQuery.recordset[0].count > 0) {
      res.status(200).json({ message: "Username already exist." });
    } else {
      let q = await pool
        .request()
        .input("firstName", sql.NVarChar, person.firstname)
        .input("lastName", sql.NVarChar, person.lastname)
        .input("userName", sql.NVarChar, person.username)
        .input("userPass", sql.NVarChar, person.password)
        .query(
          `INSERT INTO usersTbl (firstName, lastName, userName, userPass) 
        VALUES (@firstName, @lastName, @userName, @userPass);
        SELECT SCOPE_IDENTITY() AS user_Id`
        );
      res.status(200).json({ message: "Account created successfully." });
      const user_Id = q.recordset[0].user_Id;

      for (let module of localUsersModule) {
        await pool
          .request()
          .input("mod_name", sql.NVarChar, module.mod_name)
          .input("mod_active", sql.NVarChar, module.mod_active)
          .input("mod_addModule", sql.Bit, module.mod_addModule)
          .input("user_Id", sql.Int, user_Id)
          .query(
            "INSERT INTO usersModule (mod_name, mod_active, mod_addModule, user_Id) VALUES (@mod_name, @mod_active, @mod_addModule, @user_Id)"
          );
      }
    }
  } catch (err) {
    console.log(`Error API signup: ${err}`);
    res.status(500).json({ message: "Internal server error." });
  }
});

// SIGNIN Account
app.post("/signin", async (req, res) => {
  let { pPassword, uUsername } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("password", sql.NVarChar, pPassword)
      .input("userName", sql.NVarChar, uUsername)
      .query(
        "SELECT user_Id, firstName, userName, userPass FROM usersTbl WHERE userPass = @password AND userName = @userName"
      );

    if (result.recordset.length > 0) {
      const userSession = (req.session.user = result.recordset[0]);
      res.status(200).json({ message: "Login successful", user: userSession });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.log(`Error API SignIn: ${err}`);
  }
});

//Logout Account
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

//GET AllUser
app.get("/getAllUser", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let q = await pool.request().query("SELECT * FROM usersTbl");
    let allUser = q.recordset;
    res.status(200).json(allUser);
  } catch (err) {
    console.log(err);
  }
});

//GET User
app.get("/getUser", async (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user.firstName);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

//GET all person
app.get("/", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let q = await pool.request().query("SELECT * FROM person");
    let data = q.recordset;
    res.send(data);
  } catch (err) {
    console.log(`hanep na error: ${err}`);
  }
});

//GET QR
app.get("/getqr", async (req, res) => {
  const userSession = req.session.user;
  try {
    let pool = await sql.connect(config);
    let qrQuery = await pool
      .request()
      .input("user_Id", sql.Int, userSession.user_Id)
      .query("SELECT * FROM qrCode WHERE user_Id = @user_Id");
    let qrData = qrQuery.recordset;

    res.status(200).json(qrData);
  } catch (err) {
    console.log(`GET QR error: ${err}`);
    res.status(500).send("Error fetching QR code");
  }
});

//POST QR
app.post("/generate", async (req, res) => {
  const { QRitem_name, QRitem_desc, QRprice } = req.body;
  const userSession = req.session.user;
  console.log(userSession);

  try {
    let pool = await sql.connect(config);
    const qrcodeURL = await QRCode.toDataURL(QRitem_name);

    await pool
      .request()
      .input("qr_data", sql.NVarChar, qrcodeURL)
      .input("QRitem_name", sql.NVarChar, QRitem_name)
      .input("QRitem_desc", sql.NVarChar, QRitem_desc)
      .input("QRprice", sql.Float, QRprice)
      .input("user_Id", sql.Int, userSession.user_Id)
      .query(`INSERT INTO qrCode (qr_data, QRitem_name, QRitem_desc, QRprice, user_Id) 
           VALUES (@qr_data, @QRitem_name, @QRitem_desc, @QRprice, @user_Id)`);
  } catch (err) {
    console.log(`Error while generating QR: ${err}`);
    res.status(500).send("Error generating QR code");
  }
});

//UPDATE status if GOOD/BAD
app.put("/updated/status/:id", async (req, res) => {
  let id = req.params.id;
  const { status } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("qr_id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .query("UPDATE qrcode SET status = @status WHERE qr_id = @qr_id");
    res.status(200).send("Status updated successfully.");
  } catch (err) {
    console.log(`Error API UPDATE: ${err}`);
  }
});

//Download QR
app.get("/download/:filename", (req, res) => {
  const filepath = `./qrcodes/${req.params.filename}`;
  res.download(filepath);
});

//POST person
app.post("/add", async (req, res) => {
  const { lname, fname, age } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("lname", sql.NVarChar, lname)
      .input("fname", sql.NVarChar, fname)
      .input("age", sql.Int, age)
      .query(
        "INSERT INTO person (lname, fname, age) VALUES (@lname, @fname, @age)"
      );
    res.status(200).send("Person added successfully.");
  } catch (err) {
    console.log(`Error: ${err}`);
  }
});

//DELETE QR Code
app.delete("/delete/qr/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("qr_id", sql.Int, id)
      .query("DELETE from qrcode WHERE qr_id = @qr_id");
    res.status(200).send("Delete QR successfully.");
  } catch (err) {
    console.log(err);
  }
});

//DELETE user account
app.delete("/deleteUser/:id", async (req, res) => {
  let id = req.params.id;
  console.log("params", id);
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE from usersTbl WHERE user_Id = @id");
    res.status(200).send({ message: "Delete account successfully." });

    // //fixing delete user acc together with qr code
    // let Q_qr_id = await pool
    //   .request()
    //   .input("user_Id", sql.Int, id)
    //   .query("SELECT qr_id FROM usersTbl WHERE user_Id = @user_Id");
    // let qr_id = Q_qr_id.recordset;
    // console.log(qr_id);

    // await pool
    //   .request()
    //   .input("qr_id", sql.Int, qr_id)
    //   .query("DELETE qrCode WHERE qr_id = @qr_id");
  } catch (err) {
    console.log("Error Delete User Acc:", err);
  }
});

//DELETE person
app.delete("/delete/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE from person WHERE personId = @id");
    res.status(200).send("Delete person successfully.");
  } catch (err) {
    console.log(err);
  }
});

//GET Modules per User(View Modal)
app.get("/getModulePerUser", async (req, res) => {
  const userSession = req.session.user;
  try {
    let pool = await sql.connect(config);
    let q = await pool
      .request()
      .input("user_Id", sql.Int, userSession.user_Id)
      .query("SELECT * FROM usersModule");
    let data = q.recordset;
    res.status(200).json(data);
  } catch (err) {
    console.log("GetModulePerUser", err);
  }
});

//GET All Modules (SIDEBAR)
app.get("/getAllModules", async (req, res) => {
  const userSession = req.session.user;
  try {
    let pool = await sql.connect(config);
    let q2 = await pool
      .request()
      .input("user_Id", sql.Int, userSession.user_Id)
      .query("SELECT * FROM usersTbl WHERE user_Id = @user_Id");
    let data = q2.recordset[0];

    let q = await pool
      .request()
      .input("user_Id", sql.Int, data.user_Id)
      .query("SELECT * FROM usersModule WHERE user_Id = @user_Id");

    res.status(200).json(q.recordset);
  } catch (err) {
    console.log("Err API Get All Mod", err);
  }
});

//UPDATE Module Access(true/false)
app.put("/updateModules/:id", async (req, res) => {
  const updatedModules = req.body;
  let id = req.params.id;
  console.log("Mod Id", id);
  console.log("Updated Modules:", updatedModules);
  try {
    let pool = await sql.connect(config);

    for (let module of updatedModules) {
      const modAddModuleValue = Number(module.mod_addModule);
      console.log("Number:", modAddModuleValue);
      let result = await pool
        .request()
        .input("mod_addModule", sql.Bit, modAddModuleValue)
        .input("user_Id", sql.Int, module.user_Id)
        .input("mod_id", sql.Int, id)
        .input("mod_name", sql.NVarChar, module.mod_name)
        .query(
          `UPDATE usersModule
           SET mod_addModule = @mod_addModule
           WHERE mod_id = @mod_id AND user_Id = @user_Id AND mod_name = @mod_name;`
        );
      console.log("Rows affected:", result.rowsAffected);
    }

    res.status(200).send({ message: "Modules updated successfully" });
  } catch (err) {
    console.error("Error updating modules:", err);
    res.status(500).send({ message: "Error updating modules" });
  }
});

//ADD New Module/s
app.post("/addmodule", async (req, res) => {
  const localUsersModule = req.body;
  try {
    let pool = await sql.connect(config);
    let q = await pool.request().query("SELECT user_Id FROM usersTbl");
    const userId = q.recordset;

    for (let module of localUsersModule) {
      for (let usersId of userId) {
        await pool
          .request()
          .input("mod_name", sql.NVarChar, module.mod_name)
          .input("mod_active", sql.NVarChar, module.mod_active)
          .input("mod_addModule", sql.Bit, module.mod_addModule)
          .input("user_Id", sql.Int, usersId.user_Id)
          .query(
            `IF NOT EXISTS (SELECT 1 FROM usersModule WHERE mod_name = @mod_name AND user_Id = @user_Id)
          BEGIN
            INSERT INTO usersModule (mod_name, mod_active, mod_addModule, user_Id)
            VALUES (@mod_name, @mod_active, @mod_addModule, @user_Id);
          END`
          );
      }
    }
    res.status(200).send({ message: "Add Module Successful" });
  } catch (err) {
    console.log("Error add module:", err);
  }
});

//DELETE Module
app.delete("/deleteModule/:id", async (req, res) => {
  let id = req.params.id;
  console.log("DELETE MODULE ID:", id);
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("mod_id", sql.Int, id)
      .query("DELETE FROM usersModule WHERE mod_id = @mod_id");
  } catch (err) {
    console.log("DELETE Module API", err);
  }
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
