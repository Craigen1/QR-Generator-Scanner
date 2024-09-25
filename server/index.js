const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const config = require("./dbFiles/dbConfig");
const QRCode = require("qrcode");
const session = require("express-session");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const port = 8080;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

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
  let { password, email } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("password", sql.NVarChar, password)
      .input("email", sql.NVarChar, email)
      .query(
        "SELECT fullname, userEmail FROM usersTbl WHERE userPass = @password AND userEmail = @email"
      );

    if (result.recordset.length > 0) {
      const userSession = (req.session.user = result.recordset[0].fullname);
      res.status(200).json({ message: "Login successful", user: userSession });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.log(`Error API SignIn: ${err}`);
  }
});

//GET User
app.get("/getUser", async (req, res) => {
  if (req.session.user) {
    console.log("Session on getUser:", req.session.user);
    return res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

//SIGNUP
app.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("fullname", sql.NVarChar, fullname)
      .input("userEmail", sql.NVarChar, email)
      .input("userPass", sql.NVarChar, password)
      .query(
        `INSERT INTO usersTbl (fullname, userEmail, userPass) VALUES (@fullname, @userEmail, @userPass)`
      );
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

//GET QR Code
app.get("/getqr", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let q = await pool.request().query("SELECT * FROM qrCode");
    let data = q.recordset;
    res.send(data);
  } catch (err) {
    console.log(`hanep na error: ${err}`);
  }
});

//POST QR Code
app.post("/generate", async (req, res) => {
  const { QRitem_name, QRitem_desc, QRprice } = req.body;
  const qrcodeURL = await QRCode.toDataURL(QRitem_name);
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input("qr_data", sql.NVarChar, qrcodeURL)
      .input("QRitem_name", sql.NVarChar, QRitem_name)
      .input("QRitem_desc", sql.NVarChar, QRitem_desc)
      .input("QRprice", sql.Float, QRprice)
      .query(
        `INSERT INTO qrCode (qr_data, QRitem_name, QRitem_desc, QRprice) VALUES (@qr_data, @QRitem_name, @QRitem_desc, @QRprice)`
      );
  } catch (err) {
    console.log(`Error yan sha: ${err}`);
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
