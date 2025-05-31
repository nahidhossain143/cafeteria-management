const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("cafeteria.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS menu (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         price REAL NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         items TEXT NOT NULL,
         total REAL NOT NULL,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // Insert random values into menu table
    db.run(
      `INSERT INTO menu (name, price) VALUES 
        ('Burger', 150), 
        ('Pizza', 250), 
        ('Pasta', 200), 
        ('Sandwich', 120), 
        ('Fries', 80)`,
      (err) => {
        if (err) {
          console.error("Error inserting into menu:", err.message);
        } else {
          console.log("Sample data inserted into menu table.");
        }
      }
    );

    // Insert random values into orders table
    db.run(
      `INSERT INTO orders (items, total) VALUES 
        ('["Burger", "Fries"]', 230), 
        ('["Pizza", "Pasta"]', 450), 
        ('["Sandwich", "Fries"]', 200), 
        ('["Pizza", "Burger"]', 400)`,
      (err) => {
        if (err) {
          console.error("Error inserting into orders:", err.message);
        } else {
          console.log("Sample data inserted into orders table.");
        }
      }
    );

    console.log("Database initialized.");
  }
});

// Fetch all menu items
app.get("/menu", (req, res) => {
  db.all("SELECT * FROM menu", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add a new menu item
app.post("/menu", (req, res) => {
  const { name, price } = req.body;
  db.run("INSERT INTO menu (name, price) VALUES (?, ?)", [name, price], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

// Delete a menu item
app.delete("/menu/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM menu WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Menu item not found" });
    } else {
      res.json({ message: "Menu item deleted successfully" });
    }
  });
});

// Place a new order
app.post("/order", (req, res) => {
  const { items, total } = req.body;
  db.run("INSERT INTO orders (items, total) VALUES (?, ?)", [JSON.stringify(items), total], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

// Fetch all orders
app.get("/order", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Fetch a single order by ID
app.get("/order/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.json(row);
    }
  });
});

// Delete an order
app.delete("/order/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM orders WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.json({ message: "Order deleted successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
