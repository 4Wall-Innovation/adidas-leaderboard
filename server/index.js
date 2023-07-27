const app = require("express")();
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const { readdir } = require("fs").promises;
const path = require("path");

let lastAdFilename;

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

app.get("/ad", async (req, res) => {
  try {
    let ad = await nextAd();
    return res.send(ad);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.get("/data", async (req, res) => {
  try {
    let { data } = await axios.get("http://localhost:5000");
    if (!data) throw "No data";
    let jsonObj = parser.parse(data);
    if (!jsonObj) throw "No JSON Object";
    let entries = jsonObj.xml.entry;
    return res.send(entries);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

module.exports = app;
