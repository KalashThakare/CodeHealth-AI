import dotenv from "dotenv";
dotenv.config();
import { GitHub } from 'arctic';

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  process.env.GITHUB_REDIRECT_URI  
);