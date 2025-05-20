import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 4000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries WHERE user_id = $1",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(countries);

  return countries;
}
async function getCurrentUser() {
  const res = await db.query("SELECT * FROM users");
  users = res.rows;

  return users.find((user) => user.id == currentUserId);
}
app.get("/", async (req, res) => {
  // try {
  //   const res = await db.query("SELECT * FROM users");
  //   console.log(res.rows);

  //   users = res.rows;
  // } catch (err) {
  //   console.log(err);
  // }
  const currentUser = await getCurrentUser();
  console.log(currentUser);

  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) = $1",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  const inputUser = req.body["user"];
  const inputAdd = req.body["add"];

  if (inputUser) {
    currentUserId = inputUser;
    res.redirect("/");
  } else if (inputAdd) {
    res.render("new.ejs");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html

  const newMemberName = req.body["name"];
  const newMemberColor = req.body["color"];

  try {
    const res = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *",
      [
        newMemberName.slice(0, 1).toUpperCase() +
          newMemberName.slice(1).toLowerCase(),
        newMemberColor,
      ]
    );

    const id = res.rows[0].id;
    currentUserId = id;
  } catch (err) {
    console.log(err);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
