// import { FunctionComponent, useState } from 'react';
import { Model, Rate, WalutaPL } from "./models"
import { useTranslation } from "react-i18next";

// type CurrenciesSelectProps = {
//     currencies: Model,
// }


// export const CurrenciesSelect: FunctionComponent<CurrenciesSelectProps> = ({ currencies, selected, handleChange }) => {
export const CurrenciesSelect = ({ currencies, selected, onChange, midRate }: any) => {
    const { t } = useTranslation();

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
            <p>{t("mid_rate")}: <span className="label">{midRate} PLN</span></p>
        </div>
    );
}
