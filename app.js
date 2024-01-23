require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const debug = require("debug")("inventory-application:server");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const categoryRouter = require("./routes/category");
const gadgetRouter = require("./routes/gadget");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

if (process.env.NODE_ENV === "development") {
  app.use(compression());
  const connectionString = process.env.DEVELOPMENT_MONGODB_URI;
  connectToDatabase(connectionString);
}

app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/category", categoryRouter);
app.use("/gadget", gadgetRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

async function connectToDatabase(connectionString) {
  try {
    await mongoose.connect(connectionString);
    debug("successfully connected to database");
  } catch (err) {
    console.log("error");
    debug(err);
  }
}
module.exports = app;
