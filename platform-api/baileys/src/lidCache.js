const fs = require("fs");
const PATH = "lid-cache.json";

let cache = {};

try {
  cache = JSON.parse(fs.readFileSync(PATH, "utf8"));
} catch {
  cache = {};
}

function save() {
  fs.writeFileSync(PATH, JSON.stringify(cache, null, 2));
}

function set(lid, phone) {
  if (cache[lid] !== phone) {
    cache[lid] = phone;
    save();
  }
}

function get(lid) {
  return cache[lid] || null;
}

module.exports = { set, get };
