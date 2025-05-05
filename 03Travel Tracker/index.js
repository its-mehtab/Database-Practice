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
  // try {
  //   let visitedCountries = [];
  //   const res = await db.query("SELECT country_code from visited_countries");

  //   res.rows.forEach((currCountry) => {
  //     visitedCountries.push(currCountry.country_code);
  //   });

  //   return visitedCountries;
  // } catch (err) {
  //   console.error(err);
  // }
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

  try {
    const result = await db.query(
      "SELECT * FROM countries WHERE LOWER(country_name) = LOWER($1)",
      [newCountry]
    );
    if (result.rows.length === 0)
      throw new Error("Country name does not exist, try again.");

    if (visitedCountries.includes(result.rows[0].country_code)) {
      throw new Error("Country has already been added, try again.");
    }

    db.query("INSERT INTO visited_countries (country_code) VALUES($1) ", [
      result.rows[0].country_code,
    ]);

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("index.ejs", {
      countries: visitedCountries,
      total: visitedCountries.length,
      error: error.message,
    });
  }
  // if (result.rows.length !== 0) {
  //   db.query("INSERT INTO visited_countries (country_code) VALUES($1) ", [
  //     result.rows[0].country_code,
  //   ]);
  // } else if (visitedCountries.includes(result.rows[0].country_code)) {
  //   console.log("dfg");
  // }

  // db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
