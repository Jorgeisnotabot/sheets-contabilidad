import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { CLIENT_EMAIL, PRIVATE_KEY, SHEETS_ID } from '../config.js';
import { Income, Expense } from './types.js';

export default class GoogleSheets {
    private auth!: JWT;

    constructor() {
        this.auth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });
    }

    private async authorize(){
        await this.auth.authorize();
    }

    // Add income to Google Sheets

    async addIncome({ date, customerName, concept, invoice, amount, taxAmount, secondTaxAmount, thirdTaxAmount, total }: Income) {
        await this.authorize();

        const sheets = google.sheets({ version: 'v4', auth: this.auth });

        // Get the spreadsheet ID
        const spreadsheetId = SHEETS_ID;

        // Add row income to last row in specific range
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A2:K6',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [date, customerName, concept, invoice, amount, taxAmount, secondTaxAmount, thirdTaxAmount, total],
                ],
            },
        });
    }

    // Add expense to Google Sheets
    
    async addExpense({ date, supplierName, description, rfc, subTotal, taxAmount, ishAmount, isrRet, ivaRet, total, paymentMethod }: Expense) {
        await this.authorize();

        const sheets = google.sheets({ version: 'v4', auth: this.auth });

        // Get the spreadsheet ID
        const spreadsheetId = SHEETS_ID;

        // Add row expense to last row in specific range
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A13:L14',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [date, supplierName, description, rfc, subTotal, taxAmount, subTotal ,ishAmount, isrRet, ivaRet, total, paymentMethod],
                ],
            },
        });
    }

}