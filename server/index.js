const app = require("express")();
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();

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
