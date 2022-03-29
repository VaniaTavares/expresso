const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const { allColumns } = require("./api/validation");

const createTables = ({ tableName, tableColumns }) => {
  let sql = `CREATE TABLE ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, `;

  const int = "INTEGER NOT NULL";
  const text = "TEXT NOT NULL";

  const columns = [
    { title: "name", type: text },
    { title: "position", type: text },
    { title: "title", type: text },
    { title: "description", type: "TEXT NULL" },
    { title: "wage", type: int },
    { title: "is_current_employee", type: "INTEGER DEFAULT 1" },
    { title: "hours", type: int },
    { title: "rate", type: int },
    { title: "date", type: int },
    { title: "inventory", type: int },
    { title: "price", type: int },
    {
      title: "employee_id",
      type: int,
      constraint: true,
    },
    { title: "menu_id", type: int, constraint: true },
  ];

  sql = sql +=
    columns
      .filter((column) => tableColumns.includes(column.title))
      .map((col) => {
        if (col.constraint) {
          col.constraint = `, FOREIGN KEY (${
            col.title
          }) REFERENCES ${col.title.slice(0, col.title.length - 3)}(id)`;
        }
        return Object.values(col).join(" ");
      })
      .join(", ") + " )";

  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
      if (err) throw err;
    });
    db.run(sql, (err) => {
      if (err) throw err;
    });
  });
};

for (const key in allColumns) {
  createTables({ tableName: `${key}`, tableColumns: allColumns[key] });
}
