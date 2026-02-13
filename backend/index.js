require("dotenv").config(); // load env FIRST

const express = require("express");
const cors = require("cors");
const connectionofDb = require("./config/connect.js");
const path = require("path");

const app = express();

// connect database
connectionofDb();

const PORT = process.env.PORT || 8001;

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
