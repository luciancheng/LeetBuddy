// THIS FILE IS ENTRY POINT TO SERVER CODE
// To install, run "npm install" in the backend directory
// run "nodemon server" for dev mode

// backend will follow MVC architecture

// IMPORTS
const express = require("express");
require("dotenv").config();
const LLM_API_ROUTES = require("./routes/LLM_api_routes.js");
const cors = require("cors");
const { initializeRedisClient } = require("./services/LLM_config.js");

// APP INITIALIZATION
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: true }));

// Initalize redis client with err handling
async function startServer() {
  try {
    await initializeRedisClient();

    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

// middleware
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Allow requests from any origin
  },
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// routing
// LLM API ROUTING to all /LLM endpoints
app.use("/LLM", LLM_API_ROUTES);

// 404 error catching
app.use((req, res) => {
  res.status(404);
});
