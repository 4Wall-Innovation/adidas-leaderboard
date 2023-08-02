sockets = null;

const init = (server) => {
  sockets = require("socket.io")(server, {
    transports: ["websocket"],
    pingInterval: 2000,
    pingTimeout: 20000,
  });

  sockets.on("connection", (client) => {
    client.on("highlightUser", (data) => {
      console.log("highlightUser", data);
      sockets.emit("highlightUser", data);
    });
    client.on("disconnect", async function (e) {});
  });
};

module.exports = { init };
