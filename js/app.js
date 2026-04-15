async function loadPartial(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Partial konnte nicht geladen werden: ${path}`);
  }
  return response.text();
}

async function renderAppShell() {
  const app = document.getElementById("app");

  const [boardHtml, settingsHtml, questionHtml] = await Promise.all([
    loadPartial("./screens/board.html"),
    loadPartial("./screens/settings.html"),
    loadPartial("./screens/question.html")
  ]);

  app.innerHTML = boardHtml + settingsHtml + questionHtml;
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (error) {
      console.error("Service Worker konnte nicht registriert werden:", error);
    }
  }
}

window.AppImageStore = {
  DB_NAME: "der_grosse_preis_assets",
  DB_VERSION: 1,
  STORE_NAME: "images",
  db: null,

  open() {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;

        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
        };

        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  },

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  },

  async delete(key) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async set(key, value) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async get(key) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, "readonly");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || "");
      request.onerror = () => reject(request.error);
    });
  },

  async delete(key) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
};

window.AppStorage = {
  STORAGE_KEY: "der_grosse_preis_app_state",

  save() {
    const state = {
      gameData: window.AppState?.gameData || { categories: [] },
      usedQuestions: window.AppState?.usedQuestions || {},
      layout: window.AppState?.layout || {}
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  },

  load() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("Fehler beim Laden des gespeicherten Zustands:", error);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

async function init() {
  await renderAppShell();

  const savedState = window.AppStorage.load();

  window.AppState = {
    gameData: savedState?.gameData || { categories: [] },
    categoryBackgrounds: {},
    boardBackground: "",
    usedQuestions: savedState?.usedQuestions || {},
    layout: savedState?.layout || {}
  };

  const categories = window.AppState.gameData?.categories || [];

  for (const category of categories) {
    const image = await window.AppImageStore.get(`category:${category.name}`);
    if (image) {
      window.AppState.categoryBackgrounds[category.name] = image;
    }
  }

  const boardImage = await window.AppImageStore.get("boardBackground");
  if (boardImage) {
    window.AppState.boardBackground = boardImage;
  }

  window.BoardScreen.render();
  window.SettingsScreen.bind();
  window.QuestionScreen.bind();

  window.SettingsScreen.renderCategoryBackgroundInputs?.();
  window.SettingsScreen.renderBoardBackgroundInputs?.();
  window.BoardScreen.applyBackground?.();

  if (!window.AppState.gameData?.categories?.length) {
    window.SettingsScreen.open();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const questionScreen = document.getElementById("questionScreen");
    const settingsModal = document.getElementById("settingsModal");

    if (questionScreen && !questionScreen.classList.contains("hidden")) {
      window.QuestionScreen.close();
      return;
    }

    window.SettingsScreen.toggle();
  });

  const isLocalhost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  if (isLocalhost) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }
  } else {
    registerServiceWorker();
  }
}

init();