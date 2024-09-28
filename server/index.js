const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const config = require("./dbFiles/dbConfig");
const QRCode = require("qrcode");
const session = require("express-session");
const crypto = require("crypto");

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

// SIGNIN
app.post("/signin", async (req, res) => {
  let { password, username } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("password", sql.NVarChar, password)
      .input("userName", sql.NVarChar, username)
      .query(
        "SELECT firstName, userName, userPass FROM usersTbl WHERE userPass = @password AND userName = @userName"
      );

    if (result.recordset.length > 0) {
      const userSession = (req.session.user = result.recordset[0]);
      // console.log("Login Sesh", userSession);
      res.status(200).json({ message: "Login successful", user: userSession });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.log(`Error API SignIn: ${err}`);
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

//GET User
app.get("/getUser", async (req, res) => {
  if (req.session.user) {
    // console.log("Get User Sesh:", req.session.user.firstName);
    res.status(200).json(req.session.user.firstName);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

//SIGNUP
app.post("/signup", async (req, res) => {
  const { firstname, lastname, username, password } = req.body;
  try {
    let pool = await sql.connect(config);
    let existingUser = await pool
      .request()
      .input("userName", sql.NVarChar, username)
      .query(`SELECT userName FROM usersTbl WHERE userName = @userName`);

    if (existingUser.recordset.length > 0) {
      return res.status(200).json({ message: "Username already exist." });
    }

    //INSERT and empty row in qrCode table
    let qrCodeEmp = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        "INSERT INTO qrCode (qr_data, QRitem_name, QRitem_desc, QRprice) VALUES ('','','',''); SELECT SCOPE_IDENTITY() as qrCode_id"
      );
    let qrCode_id = qrCodeEmp.recordset[0].qrCode_id;
    await pool
      .request()
      .input("qr_id", sql.Int, qrCode_id)
      .input("username", sql.NVarChar, username)
      .query("UPDATE usersTbl SET qr_id = @qr_id WHERE userName = @username");

    //create new user acc
    await pool
      .request()
      .input("firstName", sql.NVarChar, firstname)
      .input("lastName", sql.NVarChar, lastname)
      .input("userName", sql.NVarChar, username)
      .input("userPass", sql.NVarChar, password)
      .input("qr_id", sql.Int, qrCode_id)
      .query(
        `INSERT INTO usersTbl (firstName, lastName, userName, userPass, qr_id) VALUES (@firstName, @lastName, @userName, @userPass, @qr_id)`
      );

    //now, delete empty row
    await pool.request().query("DELETE qrCode WHERE qr_data = ''");

    // Successfully created the user
    res.status(200).json({ message: "Account created successfully." });
  } catch (err) {
    console.log(`Error API signup: ${err}`);
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
    // 1. Fetch the QR code for the logged-in user using the user's userName (from session)
    let userQuery = await pool
      .request()
      .input("username", sql.NVarChar, userSession.userName)
      .query("SELECT qr_id FROM usersTbl WHERE userName = @username");

    //Example: userName: jethro - qr_id: 22
    let user = userQuery.recordset[0];

    // 2. Fetch the QR code details from qrCode table using the user's qr_id
    let qrQuery = await pool
      .request()
      .input("qr_id", sql.Int, user.qr_id)
      .query("SELECT * FROM qrCode WHERE qr_id = @qr_id");
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

  try {
    let pool = await sql.connect(config);
    const qrcodeURL = await QRCode.toDataURL(QRitem_name); // Generate QR code

    // Check if the user already has a qr_id in usersTbl
    let userQuery = await pool
      .request()
      .input("username", sql.NVarChar, userSession.userName)
      .query("SELECT qr_id FROM usersTbl WHERE userName = @username");

    const user = userQuery.recordset[0];

    if (user && user.qr_id) {
      // User already has a qr_id
      console.log(
        "User already has a qr_id. Inserting new QR code with the same qr_id."
      );

      // Insert the new QR code with the existing qr_id
      await pool
        .request()
        .input("qr_id", sql.Int, user.qr_id) // Keep the same qr_id
        .input("qr_data", sql.NVarChar, qrcodeURL)
        .input("QRitem_name", sql.NVarChar, QRitem_name)
        .input("QRitem_desc", sql.NVarChar, QRitem_desc)
        .input("QRprice", sql.Float, QRprice)
        .query(
          `INSERT INTO qrCode (qr_id, qr_data, QRitem_name, QRitem_desc, QRprice) 
           VALUES (@qr_id, @qr_data, @QRitem_name, @QRitem_desc, @QRprice)`
        );

      res
        .status(200)
        .send(
          `New QR code added for user: ${userSession.userName} with qr_id: ${user.qr_id}`
        );
    }
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
      .input("qrCode_id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .query("UPDATE qrcode SET status = @status WHERE qrCode_id = @qrCode_id");
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
      .input("qrCode_id", sql.Int, id)
      .query("DELETE from qrcode WHERE qrCode_id = @qrCode_id");
    res.status(200).send("Delete QR successfully.");
  } catch (err) {
    console.log(err);
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

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
