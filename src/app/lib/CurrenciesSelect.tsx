import { FunctionComponent, useState } from 'react';
import { Model, Rate, WalutaPL } from "./models"

// type CurrenciesSelectProps = {
//     currencies: Model,
// }


// export const CurrenciesSelect: FunctionComponent<CurrenciesSelectProps> = ({ currencies, selected, handleChange }) => {
export const CurrenciesSelect = ({ currencies, selected, onChange, midRate }: any) => {
    return (
        <div>
            <select value={selected} onChange={onChange} >
                {currencies &&
                    currencies.data.rates.map(function (rate: Rate) {
                        return (
                            <option key={rate.code} value={rate.code}>{rate.code} - {rate.currency}</option>
                        );
                    })
                }
            </select>
            <p>Mid rate: <span className="label">{midRate} PLN</span></p>
        </div>
    );
}
