import express from "express";
import http from "http";
import app from "./app.js";
import { startApp } from "./app.js";

const server = http.createServer(app);
const port = process.env.PORT;

const connectToDb = await startApp();

server.listen(port,()=>{
    console.log(`Backend is running on ${port}`);
})

export default server;