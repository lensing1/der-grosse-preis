window.BoardScreen = {
  selectedRow: 0,
  selectedColumn: 0,

  open() {
    const screen = document.getElementById("BoardScreen");

    if (!screen) {
      console.error("BoardScreen element not found");
      return;
    }

    screen.classList.remove("hidden");

    this.updateSelection();
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

    if (!board || !categories.length) {
      return;
    }

    const columnCount = categories.length;
    const rowCount = categories[0]?.questions?.length || 0;

    board.innerHTML = "";
    board.style.gridTemplateColumns =
      `repeat(${columnCount}, minmax(0, 1fr))`;

    // Category headers
    categories.forEach((category) => {
      const el = document.createElement("div");

      el.className = "category";
      el.textContent = category.name;

      board.appendChild(el);
    });

    // Questions
    for (let row = 0; row < rowCount; row++) {
      categories.forEach((category, column) => {
        const questionItem = category.questions[row];

        const el = document.createElement("div");

        el.className = "cell";
        el.textContent = questionItem?.points ?? "";

        // Restore clicked state from AppState
        if (
          questionItem &&
          window.AppState.usedQuestions.includes(questionItem.id)
        ) {
          el.classList.add("clicked");
        }

        el.dataset.row = row;
        el.dataset.column = column;

        el.addEventListener("click", () => {
          this.selectedRow = row;
          this.selectedColumn = column;

          this.updateSelection();
          this.selectCurrent();
        });

        board.appendChild(el);
      });
    }

    this.updateSelection();
  },

  updateSelection() {
    const board = document.getElementById("board");

    if (!board) {
      console.error("Board element not found");
      return;
    }

    // Remove old selection
    board.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("selected");
    });

    // Find current selection
    const cell = board.querySelector(
      `.cell[data-row="${this.selectedRow}"][data-column="${this.selectedColumn}"]`
    );

    if (cell) {
      cell.classList.add("selected");

      cell.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  },

  moveSelection(rowDelta, columnDelta) {
    const categories = window.AppState.gameData.categories || [];

    if (!categories.length) {
      return;
    }

    const rowCount =
      categories[0]?.questions?.length || 0;

    const columnCount =
      categories.length;

    this.selectedRow = Math.max(
      0,
      Math.min(
        rowCount - 1,
        this.selectedRow + rowDelta
      )
    );

    this.selectedColumn = Math.max(
      0,
      Math.min(
        columnCount - 1,
        this.selectedColumn + columnDelta
      )
    );

    this.updateSelection();
  },

  selectCurrent() {
    const categories =
      window.AppState.gameData.categories || [];

    const category =
      categories[this.selectedColumn];

    const questionItem =
      category?.questions?.[this.selectedRow];

    if (!category || !questionItem) {
      return;
    }

    const cell = document.querySelector(
      `.cell[data-row="${this.selectedRow}"][data-column="${this.selectedColumn}"]`
    );

    cell?.classList.add("clicked");

    window.QuestionScreen.open(
      category.name,
      questionItem
    );
  },

  resetUsedQuestions() {
    window.AppState.usedQuestions = [];

    // Re-render board so all "clicked" states disappear
    this.render();
  },

  handleKeydown(event) {
    const screen = document.getElementById("boardScreen");

    if (!screen || screen.classList.contains("hidden")) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        event.stopImmediatePropagation();
        this.moveSelection(-1, 0);
        break;

      case "ArrowDown":
        event.preventDefault();
        event.stopImmediatePropagation();
        this.moveSelection(1, 0);
        break;

      case "ArrowLeft":
        event.preventDefault();
        event.stopImmediatePropagation();
        this.moveSelection(0, -1);
        break;

      case "ArrowRight":
        event.preventDefault();
        event.stopImmediatePropagation();
        this.moveSelection(0, 1);
        break;

      case "Enter":
        event.preventDefault();
        event.stopImmediatePropagation();
        this.selectCurrent();
        break;
    }
  },
};

// Register keyboard listener
document.addEventListener("keydown", (event) => {
  window.BoardScreen.handleKeydown(event);
});
