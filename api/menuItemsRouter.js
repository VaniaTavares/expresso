const menuItemsRouter = require("express").Router({ mergeParams: true });

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const { validatePost, allColumns } = require("./validation");

const baseMenuItems = "SELECT * FROM MenuItem";

menuItemsRouter.get("/", (req, res) => {
  db.all(
    `${baseMenuItems} WHERE MenuItem.menu_id = $menu_id`,
    { $menu_id: req.params.menuId },
    (err, menuItems) => {
      if (err) {
        throw err;
      } else {
        res.status(200).send({ menuItems });
      }
    }
  );
});

menuItemsRouter.post("/", (req, res) => {
  const { name, description, inventory, price } = req.body.menuItem;

  const menu_id = req.menuId;
  const validateMenuItem = validatePost("MenuItem", {
    name,
    description,
    inventory,
    price,
    menu_id,
  });

  if (validateMenuItem) {
    db.serialize(() => {
      db.run(
        `INSERT INTO MenuItem (${allColumns.MenuItem.join(
          ", "
        )}) VALUES (${Object.keys(validateMenuItem).join(", ")})`,
        validateMenuItem,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      db.get(
        `${baseMenuItems} ORDER BY MenuItem.id DESC LIMIT 1`,
        (err, newMenuItem) => {
          if (err) {
            throw err;
          } else res.status(201).send({ menuItem: newMenuItem });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.param("menuItemId", (req, res, next, id) => {
  const menuItemId = Number(id);
  db.get(
    `${baseMenuItems} WHERE MenuItem.id = $menuItemId`,
    { $menuItemId: menuItemId },
    (err, menuItem) => {
      if (err) {
        throw err;
      } else if (menuItem) {
        req.menuItemId = menuItemId;
        next();
        return;
      } else {
        res.sendStatus(404);
      }
    }
  );
});

menuItemsRouter.put("/:menuItemId", (req, res) => {
  const { name, description, inventory, price } = req.body.menuItem;

  const menu_id = req.params.menuId;
  const validateMenuItem = validatePost("MenuItem", {
    name,
    description,
    inventory,
    price,
    menu_id,
  });

  if (validateMenuItem) {
    db.serialize(() => {
      db.run(
        "UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menu_id WHERE MenuItem.id = $menuItemId",
        { ...validateMenuItem, $menuItemId: req.menuItemId },
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      db.get(
        `${baseMenuItems} WHERE MenuItem.id = $menuItemId`,
        { $menuItemId: req.menuItemId },
        (err, menuItemRetrived) => {
          if (err) {
            throw err;
          } else res.status(200).send({ menuItem: menuItemRetrived });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.delete("/:menuItemId", (req, res) => {
  db.run(
    "DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId",
    { $menuItemId: req.menuItemId },
    (err) => {
      if (err) {
        throw err;
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = menuItemsRouter;
