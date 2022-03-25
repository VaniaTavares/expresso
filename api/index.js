const apiRouter = require("express").Router();
const employeeRouter = require("./employeeRouter");

apiRouter.use("/employees", employeeRouter);

module.exports = apiRouter;
