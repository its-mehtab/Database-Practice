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

let visitedCountries = [];

db.connect();

try {
  const res = await db.query("SELECT country_code from visited_countries");

  res.rows.forEach((currCountry) => {
    visitedCountries.push(currCountry.country_code);
  });
  console.log(visitedCountries);
} catch (err) {
  console.error(err);
} finally {
  db.end();
}

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs", {
    countries: visitedCountries,
    total: visitedCountries.length,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
