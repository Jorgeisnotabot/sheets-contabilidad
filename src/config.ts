import { config } from 'dotenv';
config();

export const { DEFAULT_EMAIL, CLIENT_EMAIL, PRIVATE_KEY, FOLDER_ID, SHEETS_NAME, SHEETS_ID } = process.env;
