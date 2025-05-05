import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  database: "world",
  password: process.env.DATABASE_PASSWORD,
});

db.connect();
async function checkVisited() {
  let visitedCountries = [];
  const res = await db.query("SELECT country_code from visited_countries");

  res.rows.forEach((currCountry) => {
    visitedCountries.push(currCountry.country_code);
  });

  return visitedCountries;
}

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const visitedCountries = await checkVisited();
  res.render("index.ejs", {
    countries: visitedCountries,
    total: visitedCountries.length,
  });
});

app.post("/add", async (req, res) => {
  const newCountry = req.body.country;
  console.log(newCountry);
  const visitedCountries = await checkVisited();

  const result = await db.query(
    "SELECT * FROM countries WHERE LOWER(country_name) = LOWER($1)",
    [newCountry]
  );
  console.log(result.rows[0].country_code);

  if (
    !visitedCountries.includes(
      result.rows[0].country_code || result.rows.length !== 0
    )
  ) {
    db.query("INSERT INTO visited_countries (country_code) VALUES($1) ", [
      result.rows[0].country_code,
    ]);
  }

  // db.end();

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
