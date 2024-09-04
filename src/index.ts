#!/usr/bin/env node

import { Command } from 'commander';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { CLIENT_EMAIL, PRIVATE_KEY, DEFAULT_EMAIL, FOLDER_ID, TEMPLATE_ID, SHEETS_NAME } from './config';

const program = new Command();



async function createSpreadsheet(title: string) {
    const auth = new JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: title
            },
        },
    });

    console.log(response.data);
}

async function shareSpreadsheet(spreadsheetId: string, email: string) {
    const auth = new JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
    });

    await auth.authorize();

    const drive = google.drive({ version: 'v3', auth });

    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: email,
        },
    });
}

async function updateSpreadsheetLocation(fileId: string, folderId: string){
    const auth = new JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
    });

    await auth.authorize();

    const drive = google.drive({ version: 'v3', auth });


    try {
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'parents',
        });

        const previousParents = file.data.parents?.join(',') || '';

        await drive.files.update({
            fileId: fileId,
            addParents: folderId,
            removeParents: previousParents,
            fields: 'id, parents',
        });

        console.log(`Moved Google Sheet with ID: ${fileId} to folder ID: ${folderId}`);
    } catch (error) {
        console.error('Error moving Google Sheet:', error);
    }

}

program
    .command('new')
    .description('Create a new Google Sheet based on a template')
    .option('-n, --name <name>', 'The name of the new Google Sheet')
    .action(async (options) => {
        const name = options.name || SHEETS_NAME;
        await createSpreadsheet(name);
    });


program
    .command('transfer')
    .description('Transfer ownership of a Google Sheet to another user')
    .option('-e, --email <email>', 'The email of the new owner')
    .option('-s, --spreadsheet <spreadsheet>', 'The ID of the Google Sheet')
    .action(async (options) => {
        const email = options.email || DEFAULT_EMAIL;
        const spreadsheet = options.spreadsheet || TEMPLATE_ID;
        await shareSpreadsheet(spreadsheet, email);
    });

 program
    .command('move')
    .description('Move a Google Sheet to a folder')
    .option('-f, --folder <folder>', 'The ID of the folder')
    .option('-s, --spreadsheet <spreadsheet>', 'The ID of the Google Sheet')
    .action(async (options) => {
        const folder = options.folder || FOLDER_ID;
        const spreadsheet = options.spreadsheet || TEMPLATE_ID;
        await updateSpreadsheetLocation(spreadsheet, folder);
    });

program.parse(process.argv);