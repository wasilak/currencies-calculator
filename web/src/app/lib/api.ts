import axios from "axios";
import { Model, RatesTable } from "./models";

export const GetCurrencies = (setCurrencies: (currencies: Model) => void) => {
    axios.get('/api/get/')
        .then(response => {
            // The API returns RatesTable directly, but we need to wrap it in Model
            const ratesTable: RatesTable = response.data;
            const model: Model = {
                data: ratesTable,
            };
            setCurrencies(model);
        })
        .catch(error => {
            console.error('Error fetching currencies:', error);
        });
};

export const checkPrometheusEnabled = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/prometheus-metrics?from=USD&to=EUR');
        return response.status !== 403; // 403 means feature is disabled
    } catch (error) {
        console.log('Prometheus feature not available:', error);
        return false;
    }
};
