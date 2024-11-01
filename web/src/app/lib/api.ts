import axios from 'axios';
import { Model, RatesTable, WalutaPL } from "./models"

export const GetCurrencies = (setCurrencies: any) => {
    axios.get('/api/get/0')
        .then(response => {
            const ratesTable: RatesTable = response.data;
            const model: Model = {
                data: ratesTable,
            }
            model.data.rates = [WalutaPL, ...model.data.rates];
            console.log("data fetched", model);
            setCurrencies(model);
        })
        .catch(error => {
            console.log(error);
        });
};
