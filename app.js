const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
const multer = require("multer");
// const { createHandler } = require("graphql-http/lib/use/express");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const compression = require("compression");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const app = express();

// app.set("view engine", "ejs");
// app.set("views", "views");

const userRoutes = require("./routes/user");
const contentRoutes = require("./routes/content");
const castRoutes = require("./routes/cast");

app.set("trust proxy", true);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // if (res.) {
  //   return res.sendStatus(200);
  // }
  next();
});
app.use(
  cors({
    origin: "http://localhost:3000", // replace with your URL
    credentials: true,
    methods: "GET,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// app.use("/graphql", createHandler({ schema, rootValue: root, graphiql: true }));

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public/imgs");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.production + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimeType === "image/jpeg" ||
//     file.mimeType === "image/jpg" ||
//     file.mimeType === "image/png"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use(helmet());
app.use(compression());

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "public", "imgs")));
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageUrl")
// );

// app.use(flash());

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/cast", castRoutes);

let server;
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then((result) => {
    server = app.listen(3000);
    // const socket = require("socket.io")(server);
    // socket.on("connection", (err) => {
    //   console.log("socket connection Success");
    // });
    console.log("connection Success");
    module.exports = server;
  })
  .catch((err) => console.log(err));
