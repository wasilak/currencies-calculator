export interface Rate {
    code: string,
    currency: string,
    mid: string,
}

export interface RatesTable {
    effectiveDate: string
    rates: Array<Rate>
}

export interface Model {
    data: RatesTable,
    // rates: Object,
    // rate_from: string,
    // rate_to: string,
    // amount_from: string,
    // amount_to: string,
    // effectiveDate: string
}

export const WalutaPL: Rate = {
    code: 'PLN',
    currency: "złoty polski",
    mid: '1.00',
};
