require("dotenv").config();
const express = require("express");
const PORT = process.env.SERVER_PORT || 4000;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
