// server.js
const express = require("express");
const path = require("path");
const baseController = require("./controllers/baseController")

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

// 404 route (if no other route matches)
app.use((req, res) => {
  res.status(404).render("index", { title: "404 - Page Not Found" });
});

// Start the server
app.listen(port, () => {
  console.log(`CSE Motors app listening on http://localhost:${port}`);
});
