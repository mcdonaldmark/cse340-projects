// server.js
const express = require("express");
const path = require("path");
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");

const app = express();
const port = process.env.PORT || 3000;

// Set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to pass a default title for pages
app.use((req, res, next) => {
  res.locals.title = "Home";
  next();
});

// Index route
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

// 404 route
app.use((req, res) => {
  res.status(404).render("index", { title: "404 - Page Not Found" });
});

// File Not Found Route
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
});

// Start the server
app.listen(port, () => {
  console.log(`CSE Motors app listening on http://localhost:${port}`);
});
