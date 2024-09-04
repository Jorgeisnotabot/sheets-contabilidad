export interface Income {
    date: string;
    customerName: string;
    concept: string;
    invoice: string;
    amount: number;
    taxAmount: number;
    secondTaxAmount: number;
    thirdTaxAmount: number;
    total: number;
}

export interface Expense {
    date: string;
    supplierName: string;
    description: string;
    rfc: string;
    subTotal: number;
    taxAmount: number;
    ishAmount: number;
    isrRet: number;
    ivaRet: number;
    total: number;
    paymentMethod: string;
}