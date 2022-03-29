const employeeRouter = require("express").Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const timesheetRouter = require("./timesheetRouter");
const { validatePost, allColumns } = require("./validation");

let baseSelect = "SELECT * FROM Employee";

employeeRouter.get("/", (_req, res) => {
  db.all(`${baseSelect} WHERE Employee.is_current_employee=1;`, (err, rows) => {
    if (err) {
      throw err;
    }
    res.status(200).send({ employees: rows });
  });
});

employeeRouter.post("/", (req, res) => {
  const employeeFilter = validatePost("Employee", req.body.employee);

  if (!employeeFilter) {
    return res.sendStatus(400);
  }

  db.serialize(() => {
    db.run(
      `INSERT INTO Employee (${allColumns.Employee.join(
        ", "
      )}) VALUES (${Object.keys(employeeFilter).join(", ")})`,
      employeeFilter,
      (err) => {
        if (err) {
          throw err;
        }
      }
    );

    db.get(
      `${baseSelect} ORDER BY Employee.id DESC LIMIT 1;`,
      (err, employee) => {
        if (err) {
          throw err;
        }
        res.status(201).send({ employee });
      }
    );
  });
});

employeeRouter.param("employeeId", (req, res, next, id) => {
  const employeeId = Number(id);
  db.get(
    `${baseSelect} WHERE Employee.id=$employeeId;`,
    { $employeeId: employeeId },
    (err, row) => {
      if (err) {
        throw err;
      } else if (row) {
        req.employee = row;
        req.employeeId = employeeId;
        return next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

employeeRouter.get("/:employeeId", (req, res) => {
  res.status(200).send({ employee: req.employee });
});

employeeRouter.put("/:employeeId", (req, res) => {
  const employeeFilter = validatePost("Employee", req.body.employee);

  if (!employeeFilter) {
    return res.sendStatus(400);
  }

  db.serialize(() => {
    db.run(
      `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee WHERE Employee.id = ${req.employeeId};`,
      employeeFilter,
      (err) => {
        if (err) {
          throw err;
        }
      }
    );

    db.get(
      `${baseSelect} WHERE Employee.id = ${req.employeeId};`,
      (err, employee) => {
        if (err) {
          throw err;
        }
        res.status(200).send({ employee });
      }
    );
  });
});

employeeRouter.delete("/:employeeId", (req, res) => {
  db.serialize(() => {
    db.run(
      `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${req.employeeId};`,
      (err) => {
        if (err) {
          throw err;
        }
      }
    );

    db.get(
      `${baseSelect} WHERE Employee.id = ${req.employeeId};`,
      (err, employee) => {
        if (err) {
          throw err;
        }
        res.status(200).send({ employee });
      }
    );
  });
});

employeeRouter.use("/:employeeId/timesheets", timesheetRouter);

module.exports = employeeRouter;
