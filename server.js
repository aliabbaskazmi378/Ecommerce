const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoute.js");
const categoryRoutes = require("./routes/categoryRoute.js");
const productRoutes = require("./routes/productRoute.js");
var cors = require("cors");
var path = require("path");

//configure env
dotenv.config();

// db config
connectDB();

//rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/products", productRoutes);

// rest API
// app.get("/", (req, res) => {
//   res.send({ message: "welcome to ecom app" });
// });

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// port
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});
