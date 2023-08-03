const { Router } = require("express");
const router = Router();
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const { readdir } = require("fs").promises;
const path = require("path");
const { dbServerURL } = require("./config.js");

let lastAdFilename;
let latestEntries = [];

const nextAd = async () => {
  let directory = path.resolve(__dirname, "../static/ads");
  let files = await readdir(directory);
  let ads = [];
  if (files.length == 0) throw "No files";

  for (let file of files) {
    let extIndex = file.lastIndexOf(".");
    ads.push({
      filename: file.substring(0, extIndex),
      ext: file.substring(extIndex + 1),
      path: `/ads/${file}`,
    });
  }
  ads.sort((a, b) => a.filename - b.filename);
  let index = ads.findIndex((ad) => ad.filename == lastAdFilename);
  if (index != -1 && index + 1 < ads.length) index++;
  else index = 0;

  let ad = ads[index];
  lastAdFilename = ad.filename;

  return ad;
};

router.get("/ad", async (req, res) => {
  try {
    let ad = await nextAd();
    return res.send(ad);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

const calcUpdates = (entries) => {
  if (latestEntries.length == 0) {
    latestEntries = entries;
    return { recentUpdates: [], topTenUpdates: [] };
  }

  let newEntries = entries.filter((entry) => {
    let match = latestEntries.find(
      (latestEntry) => latestEntry.adidasID == entry.adidasID
    );
    return !match;
  });

  newEntries.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  let updatedEntries = entries.filter((entry) => {
    let match = latestEntries.find(
      (latestEntry) => latestEntry.adidasID == entry.adidasID
    );
    return !match || match.position != entry.position;
  });
  let topTenUpdates = updatedEntries.filter((update) => update.position <= 10);

  return { newEntries, topTenUpdates };
};

router.get("/alldata", async (req, res) => {
  try {
    let { data } = await axios.get(dbServerURL);
    if (!data) throw "No data";
    let jsonObj = parser.parse(data);
    if (!jsonObj) throw "No JSON Object";
    let entries = jsonObj?.xml?.entry || [];
    res.send(entries);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

router.get("/data", async (req, res) => {
  try {
    let { data } = await axios.get(dbServerURL);
    if (!data) throw "No data";
    let jsonObj = parser.parse(data);
    if (!jsonObj) throw "No JSON Object";
    let entries = jsonObj?.xml?.entry || [];
    if (!Array.isArray(entries)) entries = [entries];

    latestEntries = latestEntries.filter((lastEntry) => {
      return !!entries.find((entry) => entry.adidasID == lastEntry.adidasID);
    });

    entries = entries.filter(
      (entry) =>
        !!entry.total && !!entry.game1 && !!entry.game2 && !!entry.game3
    );
    entries.sort((a, b) => {
      return b.total - a.total;
    });
    entries = entries.map((entry, index) => {
      return {
        ...entry,
        game1: entry.game1,
        game2: entry.game2,
        game3: entry.game3,
        total: entry.total,
        position: index + 1,
        timestamp: entry.timestampEnd,
      };
    });
    let { newEntries, topTenUpdates } = calcUpdates(entries);
    latestEntries = [...entries];

    let topThreeEntries = entries.slice(0, 3);
    let topTenUpdated = topTenUpdates.length > 0;

    entries = entries.slice(3, 10);
    tickerEntries = newEntries;
    return res.send({
      entries,
      topThreeEntries,
      tickerEntries,
      topTenUpdated,
      topTenUpdates,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});
router.put("/data", async (req, res) => {
  try {
    console.log("PUT", dbServerURL, req.body);
    await axios.put(dbServerURL, req.body);
    console.log("done");
    return res.send();
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});
module.exports = router;
