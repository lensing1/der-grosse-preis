class ExcelParser {
  constructor(fileData) {
    this.workbook = XLSX.read(fileData, { type: "array" });
    this.sheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
  }

  readCell(address) {
    const cell = this.sheet[address];
    return cell ? cell.v : "";
  }

  readRange(range) {
    return XLSX.utils.sheet_to_json(this.sheet, {
      header: 1,
      range,
      defval: ""
    }).flat();
  }

  shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  buildGameData() {
    const categories = this.readRange("A2:A9")
      .map((value) => String(value).trim())
      .filter(Boolean);

    const points = this.readRange("B2:B9")
      .map((value) => Number(value) || 0)
      .filter((value) => value !== 0);

    const questions = this.readRange("E2:E50").map((value) => String(value).trim());
    const correctAnswers = this.readRange("F2:F50").map((value) => String(value).trim());
    const answerG = this.readRange("G2:G50").map((value) => String(value).trim());
    const answerH = this.readRange("H2:H50").map((value) => String(value).trim());
    const answerI = this.readRange("I2:I50").map((value) => String(value).trim());

    const result = {
      categories: []
    };

    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const category = {
        name: categories[categoryIndex],
        questions: []
      };

      for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
        const flatIndex = categoryIndex * points.length + pointIndex;

        const question = questions[flatIndex] || "";
        const correct = correctAnswers[flatIndex] || "";
        const wrong1 = answerG[flatIndex] || "";
        const wrong2 = answerH[flatIndex] || "";
        const wrong3 = answerI[flatIndex] || "";

        const answers = this.shuffleArray(
          [correct, wrong1, wrong2, wrong3].filter(Boolean)
        );

        category.questions.push({
          points: points[pointIndex],
          question,
          correctAnswer: correct,
          answers
        });
      }

      result.categories.push(category);
    }

    return result;
  }
}

window.ExcelParser = ExcelParser;