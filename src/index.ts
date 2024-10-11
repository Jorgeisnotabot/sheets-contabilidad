#!/usr/bin/env node

import { Command } from 'commander';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { CLIENT_EMAIL, PRIVATE_KEY, DEFAULT_EMAIL, FOLDER_ID, SHEETS_NAME, SHEETS_ID } from './config.js';
import GoogleSheets from './lib/google-sheets.js';

const program = new Command();

    program
    .command('add-income')
    .description('Add income to my spreadsheet')
    .option('-d, --date <date>', 'The date of the income')
    .option('-c, --customer <customer>', 'The customer name')
    .option('-o, --concept <concept>', 'The concept of the income')
    .option('-i, --invoice <invoice>', 'The invoice number')
    .option('-a, --amount <amount>', 'The amount of the income')
    .option('-t, --tax <tax>', 'The tax amount')
    .option('-s, --second-tax <secondTax>', 'The second tax amount')
    .option('-T, --third-tax <thirdTax>', 'The third tax amount')
    // .option('-l, --total <total>', 'The total amount')
    .action(async (options) => {
        const googleSheets = new GoogleSheets();
        await googleSheets.addIncome({
            date: options.date,
            customerName: options.customer,
            concept: options.concept,
            invoice: options.invoice || '',
            amount: parseFloat(options.amount) || 0,
            taxAmount: parseFloat(options.tax) || 0,
            secondTaxAmount: parseFloat(options.secondTax) || 0,
            thirdTaxAmount: parseFloat(options.thirdTax) || 0,
            total: parseFloat(options.amount || 0) + parseFloat(options.tax) + parseFloat(options.secondTax || 0) + parseFloat(options.thirdTax || 0),
        });
    });

    program
    .command('add-expense')
    .description('Add expense to my spreadsheet')
    .option('-d, --date <date>', 'The date of the expense')
    .option('-s, --supplier <supplier>', 'The supplier name')
    .option('-e, --description <description>', 'The description of the expense')
    .option('-r, --rfc <rfc>', 'The RFC of the supplier')
    .option('-S, --sub-total <subTotal>', 'The sub-total amount')
    .option('-t, --tax <tax>', 'The tax amount')
    .option('-i, --ish <ish>', 'The ISH amount')
    .option('-I, --isr-ret <isrRet>', 'The ISR retention amount')
    .option('-v, --iva-ret <ivaRet>', 'The IVA retention amount')
    .option('-l, --total <total>', 'The total amount')
    .option('-m, --method <method>', 'The payment method')
    .action(async (options) => {
        const googleSheets = new GoogleSheets();
        await googleSheets.addExpense({
            date: options.date,
            supplierName: options.supplier,
            description: options.description || '',
            rfc: options.rfc,
            subTotal: parseFloat(options.subTotal) || 0,
            taxAmount: parseFloat(options.tax) || 0,
            ishAmount: parseFloat(options.ish) || 0,
            isrRet: parseFloat(options.isrRet) || 0,
            ivaRet: parseFloat(options.ivaRet) || 0,
            total: parseFloat(options.subTotal || 0) + parseFloat(options.tax || 0) + parseFloat(options.ish || 0) - parseFloat(options.isrRet || 0) - parseFloat(options.ivaRet || 0),
            paymentMethod: options.method || '',
        });
    });

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
        const spreadsheet = options.spreadsheet || SHEETS_ID;
        await shareSpreadsheet(spreadsheet, email);
    });

 program
    .command('move')
    .description('Move a Google Sheet to a folder')
    .option('-f, --folder <folder>', 'The ID of the folder')
    .option('-s, --spreadsheet <spreadsheet>', 'The ID of the Google Sheet')
    .action(async (options) => {
        const folder = options.folder || FOLDER_ID;
        const spreadsheet = options.spreadsheet || SHEETS_ID;
        await updateSpreadsheetLocation(spreadsheet, folder);
    });

program.parse(process.argv);