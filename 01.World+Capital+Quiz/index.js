import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let totalCorrect = 0;

let quiz = [
  { country: "France", capital: "Paris" },
  { country: "United Kingdom", capital: "London" },
  { country: "United States of America", capital: "New York" },
];

let currentQuestion = {};

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  return (currentQuestion = randomCountry);
}

app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();
  let isCorrect = false;

  console.log(answer, currentQuestion.capital);

  if (answer.toLowerCase() === currentQuestion.capital.toLowerCase()) {
    isCorrect = true;
    totalCorrect++;
  }

  nextQuestion();

  res.render("index.ejs", {
    question: currentQuestion,
    totalScore: totalCorrect,
    wasCorrect: isCorrect,
  });
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
