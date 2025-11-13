import jwt from "jsonwebtoken";

export function initSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Token not provided"));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.userId;
    console.log(`User connected: ${userId}`);

    socket.join(`user:${userId}`);

    socket.on("ping", () => socket.emit("pong"));

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
}
