window.QuestionScreen = {
  currentCategoryName: null,
  currentQuestionItem: null,
  answerRevealed: false,

  open(categoryName, questionItem) {
    const boardScreen = document.getElementById("boardScreen");
    const questionScreen = document.getElementById("questionScreen");

    this.currentCategoryName = categoryName;
    this.currentQuestionItem = questionItem;
    this.answerRevealed = false;
    this.updateAnswerLabels();

    document.getElementById("questionCategory").textContent = categoryName;
    document.getElementById("questionPoints").textContent = questionItem.points ?? "";
    document.getElementById("questionPrompt").textContent = questionItem.question || "";

    const rawAnswers = questionItem.answers || [];
    const answers = rawAnswers.filter((answer) => (answer || "").trim() !== "");
    const answerIds = ["answer1", "answer2", "answer3", "answer4"];

    if (!window.AppState.usedQuestions.includes(questionItem.id)) {
      window.AppState.usedQuestions.push(questionItem.id);
      window.AppStorage.save();
    }

    this.resetAnswerStyles();

    if (answers.length === 1) {
      answerIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.querySelector(".answer-text").textContent = "";
        el.classList.remove("answer-visible", "single-answer-reveal");
        el.classList.add("answer-hidden");
      });

      const firstAnswer = document.getElementById("answer1");
      if (firstAnswer) {
        firstAnswer.querySelector(".answer-text").textContent = answers[0];
        firstAnswer.classList.add("single-answer-reveal", "answer-hidden");
      }
    } else {
      answerIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        const answerText = answers[index] || "";
        el.querySelector(".answer-text").textContent = answerText;

        el.classList.remove(
          "single-answer-reveal",
          "correct",
          "wrong",
          "answer-hidden",
          "answer-visible"
        );

        if (answerText) {
          el.classList.add("answer-visible");
        } else {
          el.classList.add("answer-hidden");
        }
      });
    }

    const backgroundUrl = window.AppState.categoryBackgrounds[categoryName];

    if (backgroundUrl) {
      questionScreen.style.backgroundImage = `url("${backgroundUrl}")`;
      questionScreen.style.backgroundSize = "cover";
      questionScreen.style.backgroundPosition = "center";
      questionScreen.style.backgroundRepeat = "no-repeat";
    } else {
      questionScreen.style.backgroundImage = "";
    }

    boardScreen?.classList.add("hidden");
    questionScreen?.classList.remove("hidden");
  },

  close() {
    document.getElementById("questionScreen")?.classList.add("hidden");
    document.getElementById("boardScreen")?.classList.remove("hidden");

    this.currentCategoryName = null;
    this.currentQuestionItem = null;
    this.answerRevealed = false;
  },

  resetAnswerStyles() {
    ["answer1", "answer2", "answer3", "answer4"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.classList.remove(
        "correct",
        "wrong",
        "answer-hidden",
        "answer-visible",
        "single-answer-reveal"
      );
    });
  },

  revealSingleAnswer(answerElement) {
    if (!this.currentQuestionItem || !answerElement) return;

    const answerText = answerElement.querySelector(".answer-text")?.textContent.trim() || "";
    if (!answerText) return;

    const correctAnswer = (this.currentQuestionItem.correctAnswer || "").trim();

    answerElement.classList.remove("correct", "wrong");

    if (answerText === correctAnswer) {
      answerElement.classList.add("correct");
    } else {
      answerElement.classList.add("wrong");
    }
  },

  revealAnswer() {
    if (!this.currentQuestionItem || this.answerRevealed) return;

    const rawAnswers = this.currentQuestionItem.answers || [];
    const answers = rawAnswers.filter((answer) => (answer || "").trim() !== "");
    const correctAnswer = (this.currentQuestionItem.correctAnswer || "").trim();

    if (answers.length === 1) {
      const el = document.getElementById("answer1");
      if (el) {
        const answerTextElement = el.querySelector(".answer-text");

        if (answerTextElement) {
          answerTextElement.textContent = answers[0];
        }
        el.classList.remove("correct", "wrong");

        requestAnimationFrame(() => {
          el.classList.remove("answer-hidden");
          el.classList.add("answer-visible", "single-answer-reveal");
        });

        if (answers[0].trim() === correctAnswer) {
          el.classList.add("correct");
        } else {
          el.classList.add("wrong");
        }
      }

      this.answerRevealed = true;
      return;
    }

    ["answer1", "answer2", "answer3", "answer4"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const answerTextElement = el.querySelector(".answer-text");

      if (!answerTextElement) return;

      const answerText = answerTextElement.textContent.trim();

      if (!answerText) return;

      el.classList.remove("correct", "wrong");

      if (answerText === correctAnswer) {
        el.classList.add("correct");
      } else {
        el.classList.add("wrong");
      }
    });

    this.answerRevealed = true;
  },

  bind() {
    document.getElementById("closeQuestion")?.addEventListener("click", () => {
      window.QuestionScreen.close();
    });

    document.getElementById("revealAnswer")?.addEventListener("click", () => {
      window.QuestionScreen.revealAnswer();
    });

    ["answer1", "answer2", "answer3", "answer4"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("click", () => {
        window.QuestionScreen.revealSingleAnswer(el);
      });
    });

    document.addEventListener("keydown", (event) => {
      // Only handle shortcuts while the question screen is open
      const questionScreen = document.getElementById("questionScreen");
      if (!questionScreen || questionScreen.classList.contains("hidden")) {
        return;
      }

      if (event.key === "Enter" || event.key == "ArrowRight") {
        event.preventDefault();
        this.revealAnswer();
        return;
      }

      if (event.key == "ArrowLeft") {
        window.QuestionScreen.close();
        return;
      }

      if (["1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();

        const answerElement = document.getElementById(
          `answer${event.key}`
        );

        if (answerElement) {
          this.revealSingleAnswer(answerElement);
        }
      }
    });
  },

  updateAnswerLabels() {
    const questionScreen = document.getElementById("questionScreen");
    questionScreen?.classList.toggle(
      "hide-answer-labels",
      !window.AppState.answerLabelsEnabled
    );
  },
};