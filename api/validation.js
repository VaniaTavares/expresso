const allColumns = {
  Employee: ["name", "position", "wage", "is_current_employee"],
  Timesheet: ["hours", "rate", "date", "employee_id"],
  Menu: ["title"],
  MenuItem: ["name", "description", "inventory", "price", "menu_id"],
};

const validatePost = (tableName, body) => {
  if (tableName === "Employee" && !body.isCurrentEmployee) {
    body.is_current_employee = 1;
  } else if (tableName === "Employee" && body.isCurrentEmployee) {
    body.is_current_employee = body.isCurrentEmployee;
    delete body.isCurrentEmployee;
  }

  const verify = allColumns[tableName].every((elt) => {
    if (elt === "description") return true;
    else return Boolean(body[`${elt}`]) && body.hasOwnProperty(elt);
  });

  if (verify) {
    return Object.fromEntries(
      Object.entries(body).map((elt) => {
        elt[0] = `$${elt[0]}`;
        return elt;
      })
    );
  } else {
    return false;
  }
};

module.exports = { allColumns, validatePost };
