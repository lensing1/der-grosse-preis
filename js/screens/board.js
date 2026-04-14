window.BoardScreen = {
  open() {
    document.getElementById("BoardScreen")?.classList.remove("hidden");
  },

  close() {
    document.getElementById("BoardScreen")?.classList.add("hidden");
  },

  applyBackground() {
    const boardScreen = document.getElementById("boardScreen");
    if (!boardScreen) return;

    const backgroundUrl = window.AppState.boardBackground;

    if (backgroundUrl) {
      boardScreen.style.backgroundImage = `url("${backgroundUrl}")`;
      boardScreen.style.backgroundSize = "cover";
      boardScreen.style.backgroundPosition = "center";
      boardScreen.style.backgroundRepeat = "no-repeat";
      boardScreen.style.backgroundColor = "";
    } else {
      boardScreen.style.backgroundImage = "";
      boardScreen.style.background = "linear-gradient(0deg, rgb(79, 148, 171) 0%, rgb(30, 85, 107) 100%)";
      boardScreen.style.backgroundSize = "";
      boardScreen.style.backgroundPosition = "";
      boardScreen.style.backgroundRepeat = "";
    }
  },

  render() {
    const board = document.getElementById("board");
    const categories = window.AppState.gameData.categories || [];

    if (!board) return;
    if (!categories.length) {
      board.innerHTML = "";
      return;
    }

    const columnCount = categories.length;
    const rowCount = categories[0]?.questions?.length || 0;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;

    categories.forEach((category) => {
      const el = document.createElement("div");
      el.className = "category";
      el.textContent = category.name;
      board.appendChild(el);
    });

    for (let row = 0; row < rowCount; row++) {
      categories.forEach((category) => {
        const questionItem = category.questions[row];

        const el = document.createElement("div");
        el.className = "cell";
        el.textContent = questionItem?.points ?? "";

        el.addEventListener("click", () => {
          el.classList.add("clicked");
          window.QuestionScreen.open(category.name, questionItem);
        });

        board.appendChild(el);
      });
    }
  }
};