import express from "express";
import bodyParser from "body-parser";
import db from "db";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 4000;

let totalCorrect = 0;

let quiz = [];

const db = new pg.client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.DATABASE_PASSWORD,
  port: "5432",
});

await db.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  return (currentQuestion = randomCountry);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
