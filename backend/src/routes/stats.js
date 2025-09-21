const express = require("express");
const fs = require("fs").promises;
const { watchFile, unwatchFile } = require("fs");
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

let cachedStats = null;

async function calculateStats() {
  try {
    const raw = await fs.readFile(DATA_PATH);
    const items = JSON.parse(raw);
    cachedStats = {
      total: items.length,
      averagePrice:
        items.length > 0
          ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
          : 0,
    };
  } catch (err) {
    console.error("Failed to calculate stats:", err);
  }
}

// Setup file watcher with proper cleanup
const watcherCallback = () => {
  calculateStats().catch((err) =>
    console.error("Failed to recalc stats:", err)
  );
};

watchFile(DATA_PATH, { interval: 5000 }, watcherCallback);

// Cleanup function to prevent memory leaks
const cleanup = () => {
  unwatchFile(DATA_PATH, watcherCallback);
};

// Handle process termination to cleanup watchers
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

calculateStats().catch((err) => console.error("Failed to load stats:", err));

// GET /api/stats
router.get("/", (req, res, next) => {
  if (!cachedStats) {
    return calculateStats()
      .then(() => res.json(cachedStats))
      .catch(next);
  }
  res.json(cachedStats);
});

module.exports = router;
