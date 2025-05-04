import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.DATABASE_PASSWORD);

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  database: "world",
  password: process.env.DATABASE_PASSWORD,
});

db.connect;

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
