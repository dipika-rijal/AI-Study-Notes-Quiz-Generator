require("dotenv").config();

const connectDB = require("../config/db.cjs");
const Quiz = require("../models/Quiz.cjs");

async function seedQuiz() {
  await connectDB();

  const sampleQuiz = {
    topic: "Logistic Regression Basics",
    content: "Practice quiz about sigmoid, probability, threshold, and binary classification.",
    difficulty: "easy",
    sourceType: "manual",
    questions: [
      {
        questionText: "What does the sigmoid function do in logistic regression?",
        options: [
          {
            text: "It converts any real-valued input into a value between 0 and 1.",
            isCorrect: true,
            explanation: "Correct. Sigmoid squashes the model output into a probability-like value between 0 and 1."
          },
          {
            text: "It removes duplicate rows from the dataset.",
            isCorrect: false,
            explanation: "Wrong. Removing duplicate rows is a data cleaning step, not the job of sigmoid."
          },
          {
            text: "It increases the number of classes automatically.",
            isCorrect: false,
            explanation: "Wrong. Sigmoid is mainly used for binary probability output, not for automatically creating classes."
          },
          {
            text: "It calculates the final accuracy of the model.",
            isCorrect: false,
            explanation: "Wrong. Accuracy is an evaluation metric. Sigmoid only gives probability-like output."
          }
        ]
      },
      {
        questionText: "If sigmoid output is 0.8, what does it usually mean in binary classification?",
        options: [
          {
            text: "The model is 80% confident for class 1.",
            isCorrect: true,
            explanation: "Correct. In binary classification, sigmoid output is usually interpreted as probability of class 1."
          },
          {
            text: "The model is 80% confident for class 0.",
            isCorrect: false,
            explanation: "Wrong. Sigmoid output 0.8 usually means class 1 probability is 0.8, so class 0 probability is about 0.2."
          },
          {
            text: "The model has 80% accuracy.",
            isCorrect: false,
            explanation: "Wrong. One prediction probability is not the same as overall model accuracy."
          },
          {
            text: "The model is overfitting.",
            isCorrect: false,
            explanation: "Wrong. Overfitting is checked by comparing train and test performance, not from one sigmoid output."
          }
        ]
      },
      {
        questionText: "If the threshold is 0.5 and probability is 0.3, which class is predicted?",
        options: [
          {
            text: "Class 1",
            isCorrect: false,
            explanation: "Wrong. Class 1 is predicted when probability is greater than or equal to the threshold."
          },
          {
            text: "Class 0",
            isCorrect: true,
            explanation: "Correct. Since 0.3 is below 0.5, the model predicts class 0."
          },
          {
            text: "Both classes",
            isCorrect: false,
            explanation: "Wrong. In normal binary classification, the model chooses one final class after thresholding."
          },
          {
            text: "No class",
            isCorrect: false,
            explanation: "Wrong. With a threshold rule, the model still predicts a class."
          }
        ]
      }
    ]
  };

  const quiz = await Quiz.findOneAndUpdate(
    { topic: sampleQuiz.topic },
    sampleQuiz,
    { upsert: true, new: true, runValidators: true }
  );

  console.log("Sample quiz saved.");
  console.log("Quiz ID:", quiz._id.toString());

  process.exit(0);
}

seedQuiz().catch(function (error) {
  console.error(error);
  process.exit(1);
});
