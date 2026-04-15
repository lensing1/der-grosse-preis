window.SettingsScreen = {
  open() {
    document.getElementById("settingsModal")?.classList.remove("hidden");
  },

  close() {
    document.getElementById("settingsModal")?.classList.add("hidden");
  },

  toggle() {
    document.getElementById("settingsModal")?.classList.toggle("hidden");
  },

  downloadTemplate() {
    const link = document.createElement("a");
    link.href = "./Der_Große_Preis_Template.xlsx";
    link.download = "Der_Große_Preis_Template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async resetAppData() {
    const confirmed = window.confirm(
      "Willst du wirklich alle gespeicherten App-Daten löschen? Bilder, Spielstand und Cache gehen dabei verloren."
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem("der_grosse_preis_app_state");
      window.AppImageStore?.close?.();

      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase("der_grosse_preis_assets");

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("blocked"));
      });

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      window.location.reload();
    } catch (error) {
      console.error("Fehler beim Löschen der App-Daten:", error);

      alert(
        "Ein Teil der Datenbank war noch geöffnet. Die Seite wird jetzt neu geladen. Danach kannst du den Reset erneut ausführen."
      );

      window.location.reload();
    }
  },

  renderCategoryBackgroundInputs() {
    const section = document.getElementById("categoryBackgroundSection");
    const list = document.getElementById("categoryBackgroundList");
    const categories = window.AppState.gameData.categories || [];

    if (!section || !list) return;

    list.innerHTML = "";

    if (!categories.length) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");

    categories.forEach((category, index) => {
      const item = document.createElement("div");
      item.className = "category-background-item";

      const safeInputId = `categoryBackgroundInput-${index}`;
      const safePreviewId = `categoryBackgroundPreview-${index}`;

      item.innerHTML = `
        <div class="category-background-name">${category.name}</div>

        <div class="category-background-upload">
          <input
            type="file"
            id="${safeInputId}"
            class="category-background-input"
            accept="image/*"
          />

          <label for="${safeInputId}" class="category-background-label">
            <div
              id="${safePreviewId}"
              class="category-background-preview"
              aria-label="Hintergrundbild für ${category.name}"
            >
              <span class="plus-icon">+</span>
            </div>
          </label>
        </div>
      `;

      list.appendChild(item);

      const input = document.getElementById(safeInputId);
      const preview = document.getElementById(safePreviewId);

      const existingImage = window.AppState.categoryBackgrounds?.[category.name];
      if (existingImage && preview) {
        preview.style.backgroundImage = `url("${existingImage}")`;
        preview.textContent = "";
        preview.classList.add("has-image");
      }

      input?.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async () => {
          const imageDataUrl = reader.result;

          window.AppState.categoryBackgrounds[category.name] = imageDataUrl;

          await window.AppImageStore.set(
            `category:${category.name}`,
            imageDataUrl
          );

          if (preview) {
            preview.style.backgroundImage = `url("${imageDataUrl}")`;
            preview.textContent = "";
            preview.classList.add("has-image");
          }
        };

        reader.readAsDataURL(file);
      });
    });
  },

  renderBoardBackgroundInputs() {
    const section = document.getElementById("boardBackgroundSection");
    const list = document.getElementById("boardBackgroundList");
    const categories = window.AppState.gameData?.categories || [];

    if (!section || !list) return;

    list.innerHTML = "";

    if (!categories.length) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");

    const hasImage = !!window.AppState.boardBackground;

    const item = document.createElement("div");
    item.className = "category-background-item";

    const inputId = "boardBackgroundInput";
    const previewId = "boardBackgroundPreview";
    const removeId = "removeBoardBackgroundButton";

    item.innerHTML = `
      <div class="category-background-name">Board</div>

      <div class="category-background-upload">
        <input
          type="file"
          id="${inputId}"
          class="category-background-input"
          accept="image/*"
        />

        <label for="${inputId}" class="category-background-label">
          <div
            id="${previewId}"
            class="category-background-preview"
            aria-label="Hintergrundbild für das Board"
          >
            <span class="plus-icon">+</span>
          </div>
        </label>

        ${hasImage ? `
          <div
            type="button"
            id="${removeId}"
            class="remove-button"
            aria-label="Bild entfernen"
          >
            ×
          </div>
        ` : ""}
      </div>
    `;

    list.appendChild(item);

    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const removeButton = document.getElementById(removeId);

    const existingImage = window.AppState.boardBackground;
    if (existingImage && preview) {
      preview.style.backgroundImage = `url("${existingImage}")`;
      preview.textContent = "";
      preview.classList.add("has-image");
    }

    input?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async () => {
        const imageDataUrl = reader.result;

        window.AppState.boardBackground = imageDataUrl;

        await window.AppImageStore.set("boardBackground", imageDataUrl);

        if (preview) {
          preview.style.backgroundImage = `url("${imageDataUrl}")`;
          preview.textContent = "";
          preview.classList.add("has-image");
        }

        window.BoardScreen.applyBackground?.();
        window.SettingsScreen.renderBoardBackgroundInputs();
      };

      reader.readAsDataURL(file);
    });

    removeButton?.addEventListener("click", async () => {
      window.AppState.boardBackground = "";

      await window.AppImageStore.delete("boardBackground");

      if (preview) {
        preview.style.backgroundImage = "";
        preview.innerHTML = `<span class="plus-icon">+</span>`;
        preview.classList.remove("has-image");
      }

      window.BoardScreen.applyBackground?.();
      window.SettingsScreen.renderBoardBackgroundInputs();
    });
  },

  bind() {
    const fileInput = document.getElementById("fileInput");
    const closeSettingsButton = document.getElementById("closeSettingsButton");

    if (!fileInput) {
      console.error("fileInput not found");
      return;
    }
    document.getElementById("resetAppButton")?.addEventListener("click", async () => {
      await window.SettingsScreen.resetAppData();
    });

    const resetButton = document.getElementById("resetAppButton");
    if (resetButton) {
      const hasGameData = !!window.AppState.gameData?.categories?.length;
      resetButton.classList.toggle("hidden", !hasGameData);
    }

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        try {
          const data = new Uint8Array(loadEvent.target.result);
          const parser = new window.ExcelParser(data);
          const gameData = parser.buildGameData();

          window.AppState.gameData = gameData;
          window.AppStorage.save();

          document.getElementById("resetAppButton")?.classList.remove("hidden");

          window.BoardScreen.render();
          window.SettingsScreen.renderCategoryBackgroundInputs();
          window.SettingsScreen.renderBoardBackgroundInputs();

        } catch (error) {
          console.error(error);
          alert("Die Excel-Datei konnte nicht verarbeitet werden.");
        }
      };

      reader.onerror = () => {
        console.error("Failed to read file.");
        alert("Die Datei konnte nicht gelesen werden.");
      };

      reader.readAsArrayBuffer(file);
    });

    closeSettingsButton?.addEventListener("click", () => {
      window.SettingsScreen.close();
    });
  }
};