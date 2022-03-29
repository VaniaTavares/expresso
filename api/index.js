const apiRouter = require("express").Router();
const employeeRouter = require("./employeeRouter");
const menuRouter = require("./menuRouter");

apiRouter.use("/employees", employeeRouter);
apiRouter.use("/menus", menuRouter);

module.exports = apiRouter;
