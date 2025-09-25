import express from "express";
import http from "http";
import app from "./app.js";
import { startApp } from "./app.js";
import ngrok from '@ngrok/ngrok';


const server = http.createServer(app);
const port = process.env.PORT;

const connectToDb = await startApp();

server.listen(port,()=>{
    console.log(`Backend is running on ${port}`);
})

// const url = await ngrok.connect({ addr: port, authtoken_from_env: true });
// console.log('ngrok tunnel started at:', url.url ? url.url() : url);

export default server;