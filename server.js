const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);

  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ WebSocket connected:", socket.id);

    socket.on("join-blog", (blogId) => {
      socket.join(blogId);
      console.log("👤 User joined blog room:", blogId);
    });

    socket.on("like-blog", (data) => {
      console.log("📩 like-blog received:", data);
      io.to(data.blogId).emit("blog-liked", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected:", socket.id);
    });
  });

  expressApp.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});
