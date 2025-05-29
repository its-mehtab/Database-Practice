import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 4000;

const db = new pg.Client({
  user: "postgres",
  password: process.env.DATABASE_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "permalist",
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

// async function getItems() {
//   try {
//     const res = await db.query("SELECT * FROM items");
//     items = res.rows;
//   } catch (err) {
//     console.error(err);
//   }
// }

app.get("/", async (req, res) => {
  // getItems();
  try {
    const res = await db.query("SELECT * FROM items");
    items = res.rows;
  } catch (err) {
    console.error(err);
  }
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  // items.push({ title: item });
  db.query("INSERT INTO items (title) VALUES ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", (req, res) => {
  const { updatedItemId, updatedItemTitle } = req.body;
  db.query("UPDATE items SET title = $1 WHERE id = $2", [
    updatedItemTitle,
    updatedItemId,
  ]);
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const id = req.body.deleteItemId;

  db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
