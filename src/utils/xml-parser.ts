import { parseString } from 'xml2js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..', '..');
const inputDir = path.join(projectRoot, 'input');
const outputDir = path.join(projectRoot, 'output');

export interface InvoiceData {
  SubTotal: string;
  Descuento: string;
  Total: string;
  MetodoPago?: string;
  Emisor: {
    Rfc: string;
    RegimenFiscal: string;
    Nombre: string;
  },
  Impuestos: {
    TotalImpuestosTrasladados: string;
    }
    FechaTimbrado?: string;
    Conceptos?: Array<{
        Descripcion: string;
    }>
}

async function parseCFDI(xmlString: string): Promise<InvoiceData> {
  return new Promise((resolve, reject) => {
    parseString(xmlString, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const cfdi = result['cfdi:Comprobante'];
        const invoiceData: InvoiceData = {
          SubTotal: cfdi.$.SubTotal,
            Descuento: cfdi.$.Descuento || '0',
            Total: cfdi.$.Total,
            MetodoPago: cfdi.$.MetodoPago,
            Emisor: {
                Rfc: cfdi['cfdi:Emisor'].$.Rfc,
                RegimenFiscal: cfdi['cfdi:Emisor'].$.RegimenFiscal,
                Nombre: cfdi['cfdi:Emisor'].$.Nombre,
            },
            Impuestos: {
                TotalImpuestosTrasladados: cfdi['cfdi:Impuestos'].$.TotalImpuestosTrasladados,
            },
            FechaTimbrado: cfdi['cfdi:Complemento']['tfd:TimbreFiscalDigital'].$.FechaTimbrado,
            Conceptos: Array.isArray(cfdi['cfdi:Conceptos']['cfdi:Concepto'])
            ? cfdi['cfdi:Conceptos']['cfdi:Concepto']
            : [cfdi['cfdi:Conceptos']['cfdi:Concepto']],
        };
        resolve(invoiceData);
      }
    });
  });
}

export async function main() {
    const allInvoiceData: InvoiceData[] = [];
  try {
    const files = await fs.readdir(inputDir);
    const xmlFiles = files.filter((file) => file.endsWith('.xml'));

    // Parse each XML file
    for (const xmlFile of xmlFiles) {
      try {
        const xmlString = await fs.readFile(path.join(inputDir, xmlFile), 'utf-8');
        const invoiceData = await parseCFDI(xmlString);
        allInvoiceData.push(invoiceData);
      } catch (error) {
        console.error('Error parsing CFDI:', error);
      }

      
     
    }
    console.log(JSON.stringify(allInvoiceData, null, 2));
    return allInvoiceData;
  } catch (error) {
    console.error('Error reading input folder:', error);
  }
}

// Call the main function to execute the script
main();