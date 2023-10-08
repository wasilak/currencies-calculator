import { useState, useEffect } from "react";
import { CurrenciesSelect } from "./lib/CurrenciesSelect"
import { CurrenciesHeader } from "./lib/CurrenciesHeader"
import { Model, RatesTable, WalutaPL, Rate } from "./lib/models"

const App = () => {
    const [currencies, setCurrencies] = useState<Model>(undefined);

    const GetCurrencies = () => {
        fetch('/api/get/0')
            .then((res) => res.json())
            .then((data) => {
                let ratesTable: RatesTable = data;
                let model: Model = {
                    data: ratesTable,
                }
                model.data.rates = [WalutaPL, ...model.data.rates];
                setCurrencies(model);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    useEffect(() => {
        GetCurrencies();
    }, []);

    const midRateCalculate = (selected: string): string => {
        if (currencies) {

            return currencies.data.rates.filter((value: Rate) => {
                return value.code == selected;
            })[0].mid;
        }

        return '1.0';
    };

    const [selectedFrom, setSelectedFrom] = useState(WalutaPL.code);
    const [midRateFrom, setMidRateFrom] = useState(midRateCalculate(WalutaPL.code));
    const [selectedTo, setSelectedTo] = useState(WalutaPL.code);
    const [midRateTo, setMidRateTo] = useState(midRateCalculate(WalutaPL.code));
    const [amountFrom, setAmountFrom] = useState(1);
    const [amountTo, setAmountTo] = useState(1);

    const doCalculation = (): number => {
        const result: number = (parseFloat(midRateFrom) * amountFrom / parseFloat(midRateTo));
        return result;
    };

    const handleChangeFrom = (selectedOption: any) => {
        setSelectedFrom(selectedOption.target.value);
        setMidRateFrom(midRateCalculate(selectedOption.target.value));
    };

    const handleChangeTo = (selectedOption: any) => {
        setSelectedTo(selectedOption.target.value);
        setMidRateTo(midRateCalculate(selectedOption.target.value));
    };

    const handleAmountFrom = (event: any) => {
        setAmountFrom(event.target.valueAsNumber);
    };

    useEffect(() => {
        setAmountTo(doCalculation());
    }, [midRateTo, midRateFrom, amountFrom])

    return (
        <div className="row">
            <div className="small-12 medium-8 large-6 small-centered columns">
                <div className="row">
                    <CurrenciesHeader currencies={currencies}></CurrenciesHeader>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <h3>From:</h3>
                        <CurrenciesSelect currencies={currencies} selected={selectedFrom} onChange={handleChangeFrom} midRate={midRateFrom}></CurrenciesSelect>

                        <h3>To:</h3>
                        <CurrenciesSelect currencies={currencies} selected={selectedTo} onChange={handleChangeTo} midRate={midRateTo}></CurrenciesSelect>

                        <div>
                            <h3>Amount:</h3>
                            <input type="number" name="" defaultValue={amountFrom} placeholder="Amount to calculate..." onChange={handleAmountFrom}></input>

                            <h5 className="subheader">Wartość w wybranej walucie:</h5>
                            <div className="panel callout">
                                <p>{amountFrom} {selectedFrom} = {amountTo} {selectedTo}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}

export default App
