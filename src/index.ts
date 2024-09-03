#!/usr/bin/env node

import { Command } from 'commander';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { CLIENT_EMAIL, PRIVATE_KEY, DEFAULT_EMAIL, FOLDER_ID, TEMPLATE_ID, SHEETS_NAME } from './config';

const program = new Command();

program
    .command('new')
    .description('Create a new Google Sheet based on a template')
    .option('-t, --template <template>', 'The ID of the template Google Sheet')
    .option('-n, --name <name>', 'The name of the new Google Sheet')
    .option('-f, --folder <folder>', 'The ID of the folder to place the new Google Sheet in')
    .option('-o, --owner <owner>', 'The email address of the new owner')
    .action(async (options) => {
        const template = options.template || TEMPLATE_ID; 
        const name = options.name || SHEETS_NAME;
        const owner = options.owner || DEFAULT_EMAIL;
        const folder = options.folder || FOLDER_ID;

        const auth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file', 
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        await auth.authorize();

        const drive = google.drive({ version: 'v3', auth });

        try {
            const copyResponse = await drive.files.copy({
                fileId: template,
                requestBody: {
                    name,
                    parents: folder ? [folder] : undefined,
                },
            });

            const fileId = copyResponse.data.id;
            if (typeof fileId === 'string') {
                await drive.permissions.create({
                    fileId: fileId,
                    requestBody: {
                        role: 'owner',
                        type: 'user',
                        emailAddress: owner,
                    },
                });

                console.log(`Created new Google Sheet with ID: ${fileId}`);
            } else {
                console.error('Failed to create Google Sheet: Invalid file ID');
            }
        } catch (error) {
            console.error('Error creating Google Sheet:', error);
        } 
    });

program.parse(process.argv);