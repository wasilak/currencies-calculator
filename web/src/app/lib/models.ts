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
}

export const WalutaPL: Rate = {
    code: 'PLN',
    currency: "złoty polski",
    mid: '1.00',
};
