const timesheetRouter = require("express").Router({ mergeParams: true });
const req = require("express/lib/request");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const { validatePost, allColumns } = require("./validation");

let baseSelect = "SELECT * FROM Timesheet";

timesheetRouter.get("/", (req, res) => {
  db.all(
    `${baseSelect} WHERE Timesheet.employee_id = $employee_id`,
    { $employee_id: req.employeeId },
    (err, timesheets) => {
      if (err) {
        throw err;
      }
      res.status(200).send({ timesheets });
    }
  );
});

timesheetRouter.post("/", (req, res) => {
  const { timesheet } = req.body;
  timesheet.employee_id = req.employeeId;
  const validateTimesheet = validatePost("Timesheet", timesheet);
  if (validateTimesheet) {
    db.serialize(() => {
      db.run(
        `INSERT INTO Timesheet (${allColumns.Timesheet.join(
          ", "
        )}) VALUES (${Object.keys(validateTimesheet).join(", ")})`,
        validateTimesheet,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );

      db.get(
        `${baseSelect} ORDER BY Timesheet.id DESC LIMIT 1;`,
        (err, timesheetRetrieved) => {
          if (err) {
            throw err;
          }
          res.status(201).send({ timesheet: timesheetRetrieved });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

timesheetRouter.param("timesheetId", (req, res, next, id) => {
  const timesheetId = Number(id);
  db.get(
    `${baseSelect} WHERE Timesheet.id = $timesheetId`,
    {
      $timesheetId: timesheetId,
    },
    (err, timesheet) => {
      if (err) {
        throw err;
      } else if (timesheet) {
        req.timesheetId = timesheetId;
        next();
        return;
      } else {
        res.sendStatus(404);
      }
    }
  );
});

timesheetRouter.put("/:timesheetId", (req, res) => {
  const { timesheet } = req.body;
  timesheet.employee_id = req.employeeId;
  const validateTimesheet = validatePost("Timesheet", timesheet);

  if (validateTimesheet) {
    db.serialize(() => {
      db.run(
        `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE Timesheet.id = ${req.timesheetId}`,
        validateTimesheet,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );

      db.get(
        `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`,
        {
          $timesheetId: req.timesheetId,
        },
        (err, timesheetRow) => {
          if (err) {
            throw err;
          }

          res.status(200).send({ timesheet: timesheetRow });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

timesheetRouter.delete("/:timesheetId", (req, res) => {
  db.run(
    "DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId",
    { $timesheetId: req.timesheetId },
    (err) => {
      if (err) {
        throw err;
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = timesheetRouter;
