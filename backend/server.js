// THIS FILE IS ENTRY POINT TO SERVER CODE
// To install, run "npm install" in the backend directory
// run "nodemon server" for dev mode

// backend will follow MVC architecture

// IMPORTS
const express = require("express");
require("dotenv").config();
const LLM_API_ROUTES = require("./routes/LLM_api_routes.js");
const cors = require('cors');

// APP INITIALIZATION
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));

// begin listening to port
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

// routing
// LLM API ROUTING to all /LLM endpoints
app.use("/LLM", LLM_API_ROUTES);

// 404 error catching
app.use((req, res) => {
  res.status(404);
});
