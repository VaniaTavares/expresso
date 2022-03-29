const menuRouter = require("express").Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);
const { validatePost, allColumns } = require("./validation");

const menuItemsRouter = require("./menuItemsRouter");

let baseMenu = "SELECT * FROM Menu";
menuRouter.get("/", (_req, res) => {
  db.all(baseMenu, (err, menus) => {
    if (err) {
      throw err;
    } else {
      res.status(200).send({ menus });
    }
  });
});

menuRouter.post("/", (req, res) => {
  const { menu } = req.body;
  const validateMenu = validatePost("Menu", menu);

  if (validateMenu) {
    db.serialize(() => {
      db.run(
        `INSERT INTO Menu (${allColumns.Menu.join(", ")}) VALUES (${Object.keys(
          validateMenu
        ).join(", ")})`,
        validateMenu,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      db.get(
        `${baseMenu} ORDER BY Menu.id DESC LIMIT 1`,
        (err, menuRetrived) => {
          if (err) {
            throw err;
          } else res.status(201).send({ menu: menuRetrived });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

menuRouter.param("menuId", (req, res, next, id) => {
  const menuId = Number(id);
  db.get(
    `${baseMenu} WHERE Menu.id = $menuId`,
    { $menuId: menuId },
    (err, menu) => {
      if (err) {
        throw err;
      } else if (menu) {
        req.menu = menu;
        req.menuId = menuId;
        next();
        return;
      } else {
        res.sendStatus(404);
      }
    }
  );
});

menuRouter.get("/:menuId", (req, res) => {
  res.status(200).send({ menu: req.menu });
});

menuRouter.put("/:menuId", (req, res) => {
  const { menu } = req.body;

  const validateMenu = validatePost("Menu", menu);

  if (validateMenu) {
    db.serialize(() => {
      db.run(
        "UPDATE Menu SET title = $title WHERE Menu.id = $menuId",
        { ...validateMenu, $menuId: req.menuId },
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      db.get(
        `${baseMenu} WHERE Menu.id = $menuId`,
        { $menuId: req.menuId },
        (err, menuRetrived) => {
          if (err) {
            throw err;
          } else res.status(200).send({ menu: menuRetrived });
        }
      );
    });
  } else {
    res.sendStatus(400);
  }
});

menuRouter.delete("/:menuId", (req, res) => {
  db.get(
    "SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId",
    { $menuId: req.menuId },
    (err, menuItem) => {
      if (err) {
        throw err;
      } else if (menuItem) {
        res.sendStatus(400);
      } else {
        db.run(
          "DELETE FROM Menu WHERE Menu.id = $menuId",
          { $menuId: req.menuId },
          (err) => {
            if (err) {
              throw err;
            } else {
              res.sendStatus(204);
            }
          }
        );
      }
    }
  );
});

menuRouter.use("/:menuId/menu-items", menuItemsRouter);

module.exports = menuRouter;
