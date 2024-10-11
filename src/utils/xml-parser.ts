import { parseString } from 'xml2js';
import fs from 'fs/promises';


interface InvoiceData {
    SubTotal: string;
    Descuento: string;
    Total: string;
    TipoDeComprobante: string;
    MetodoPago: string;
    Moneda: string;
    TipoCambio: string;
    LugarExpedicion: string;
    Exportacion: string;
    Emisor: {
      Rfc: string;
      RegimenFiscal: string;
      Nombre: string;
    };
    Receptor: {
      Rfc: string;
      UsoCFDI: string;
      Nombre: string;
      DomicilioFiscalReceptor: string;
      RegimenFiscalReceptor: string;
    };
    Conceptos: {
      Cantidad: string;
      Descripcion: string;
      NoIdentificacion: string;
      Importe: string;
      Unidad: string;
      ValorUnitario: string;
      ClaveProdServ: string;
      ClaveUnidad: string;
      Descuento: string;
      ObjetoImp: string;
    }[];
    Impuestos: {
      TotalImpuestosTrasladados: string;
      Traslados: {
        Base: string;
        Impuesto: string;
        TipoFactor: string;
        TasaOCuota: string;
        Importe: string;
      }[];
    };
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
            Descuento: cfdi.$.Descuento,
            Total: cfdi.$.Total,
            TipoDeComprobante: cfdi.$.TipoDeComprobante,
            MetodoPago: cfdi.$.MetodoPago,
            Moneda: cfdi.$.Moneda,
            TipoCambio: cfdi.$.TipoCambio,
            LugarExpedicion: cfdi.$.LugarExpedicion,
            Exportacion: cfdi.$.Exportacion,
            Emisor: {
              Rfc: cfdi['cfdi:Emisor'].$.Rfc,
              RegimenFiscal: cfdi['cfdi:Emisor'].$.RegimenFiscal,
              Nombre: cfdi['cfdi:Emisor'].$.Nombre,
            },
            Receptor: {
              Rfc: cfdi['cfdi:Receptor'].$.Rfc,
              UsoCFDI: cfdi['cfdi:Receptor'].$.UsoCFDI,
              Nombre: cfdi['cfdi:Receptor'].$.Nombre,
              DomicilioFiscalReceptor: cfdi['cfdi:Receptor'].$.DomicilioFiscalReceptor,
              RegimenFiscalReceptor: cfdi['cfdi:Receptor'].$.RegimenFiscalReceptor,
            },
            Conceptos: cfdi['cfdi:Conceptos']['cfdi:Concepto'].map((concepto: any) => ({
              Cantidad: concepto.$.Cantidad,
              Descripcion: concepto.$.Descripcion,
              NoIdentificacion: concepto.$.NoIdentificacion,
              Importe: concepto.$.Importe,
              Unidad: concepto.$.Unidad,
              ValorUnitario: concepto.$.ValorUnitario,
              ClaveProdServ: concepto.$.ClaveProdServ,
              ClaveUnidad: concepto.$.ClaveUnidad,
              Descuento: concepto.$.Descuento,
              ObjetoImp: concepto.$.ObjetoImp,
            })),
            Impuestos: {
              TotalImpuestosTrasladados: cfdi['cfdi:Impuestos'].$.TotalImpuestosTrasladados,
              Traslados: cfdi['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'].map((traslado: any) => ({
                Base: traslado.$.Base,
                Impuesto: traslado.$.Impuesto,
                TipoFactor: traslado.$.TipoFactor,
                TasaOCuota: traslado.$.TasaOCuota,
                Importe: traslado.$.Importe,
              })),
            },
          };
          resolve(invoiceData);
        }
      });
    });
  }

  async function main() {
    try {
      const xmlString = await fs.readFile('path/to/your/invoice.xml', 'utf-8');
      const invoiceData = await parseCFDI(xmlString);
      console.log(JSON.stringify(invoiceData, null, 2));
    } catch (error) {
      console.error('Error parsing CFDI:', error);
    }
  }
  

