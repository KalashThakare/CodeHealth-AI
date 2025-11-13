import http from "http";
import app from "./app.js";
import { startApp } from "./app.js";
import ngrok from '@ngrok/ngrok';
import sequelize from "./database/db.js";
import "./database/models/association.js"

import {Server} from "socket.io";
import { initSocket } from "./socket.js";


const server = http.createServer(app);
const port = process.env.PORT;

export const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000"
  }
})

initSocket(io);

const connectToDb = await startApp();

const syncDatabase = async () => {
  try {
    
    await sequelize.sync({ alter: true })

  } catch (error) {
    console.error("Database sync error:", error.message);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error("\n🔧 To fix this, run the following SQL in your database:");
      console.error("   DELETE FROM webhook_events WHERE \"projectId\" NOT IN (SELECT id FROM projects);\n");
      process.exit(1);
    }
  }
};

await syncDatabase();

server.listen(port,()=>{
    console.log(`Backend is running on ${port}`);
})

const url = await ngrok.connect({ addr: port, authtoken_from_env: true });
console.log('ngrok tunnel started at:', url.url ? url.url() : url);

export default server;