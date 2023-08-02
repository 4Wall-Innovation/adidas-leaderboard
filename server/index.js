const express = require("express");
const app = express();
app.use(express.json());

const { build, loadNuxt } = require("nuxt");

const routes = require("./routes");
let sockets = require("./sockets");

const start = async () => {
  const server = require("http").createServer(app);
  sockets.init(server);

  app.use("/api", routes);
  nuxt = await loadNuxt({ for: "dev" });
  build(nuxt);
  app.use(nuxt.render);
  server.listen(3000, () => {
    console.log(`App listening on port ${3000}`);
  });
};
start();
