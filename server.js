require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.SERVER_PORT || 4000;

const apiRouter = require("./api");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use("/api", apiRouter);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

module.exports = app;
