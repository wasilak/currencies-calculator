import { useState, useEffect, useCallback } from "react";
import { CurrenciesSelect } from "./lib/CurrenciesSelect"
import { CurrenciesHeader } from "./lib/CurrenciesHeader"
import { Model, Rate } from "./lib/models"
import { GetCurrencies } from "./lib/api"
import LanguageDetector from 'i18next-browser-languagedetector';

import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { initReactI18next } from "react-i18next";
import Translations from "./lib/locales";

import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import ChartButton from "./components/chart-button";

const resources = Translations()

const defaultCurrency = "PLN"; // PLN is the base currency (baseline = 1)

i18next.use(LanguageDetector).use(initReactI18next).init({
    resources,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

const App = () => {
    const [currencies, setCurrencies] = useState<Model | null>(null);

    const { t } = useTranslation();

    const midRateCalculate = useCallback((selected: string): string => {
        if (currencies && currencies.data && currencies.data.rates) {
            const rate = currencies.data.rates.find((value: Rate) => {
                return value.code === selected;
            });
            if (rate) {
                return rate.mid;
            }
        }
        return '1.0';
    }, [currencies]);

    const getCurrencyFromLocalStorage = (requestType: string): string => {
        const item = localStorage.getItem(requestType);
        if (item && item.length > 0) {
            return item;
        }

        return defaultCurrency;
    };

    const [selectedFrom, setSelectedFrom] = useState(defaultCurrency);
    const [midRateFrom, setMidRateFrom] = useState(midRateCalculate(defaultCurrency));
    const [selectedTo, setSelectedTo] = useState(defaultCurrency);
    const [midRateTo, setMidRateTo] = useState(midRateCalculate(defaultCurrency));
    const [amountFrom, setAmountFrom] = useState(1);
    const [amountTo, setAmountTo] = useState(1);

    const doCalculation = useCallback((): number => {
        const result: number = (parseFloat(midRateFrom) * amountFrom / parseFloat(midRateTo));
        return result;
    }, [midRateFrom, amountFrom, midRateTo]);

    const handleChangeFrom = (selectedOption: any) => {
        setSelectedFrom(selectedOption.target.value);
        localStorage.setItem("from", selectedOption.target.value);
        setMidRateFrom(midRateCalculate(selectedOption.target.value));
    };

    const handleChangeTo = (selectedOption: any) => {
        setSelectedTo(selectedOption.target.value);
        localStorage.setItem("to", selectedOption.target.value);
        setMidRateTo(midRateCalculate(selectedOption.target.value));
    };

    const handleAmountFrom = (event: any) => {
        if (event.target.value) {
            setAmountFrom(event.target.value);
        } else {
            setAmountFrom(0);
        }
    };

    useEffect(() => {
        GetCurrencies(setCurrencies);
    }, []);

    useEffect(() => {
        setSelectedFrom(getCurrencyFromLocalStorage("from"));
        setSelectedTo(getCurrencyFromLocalStorage("to"));
        setMidRateFrom(midRateCalculate(getCurrencyFromLocalStorage("from")));
        setMidRateTo(midRateCalculate(getCurrencyFromLocalStorage("to")));
    }, [currencies, midRateCalculate]);

    useEffect(() => {
        setAmountTo(doCalculation());
    }, [midRateTo, midRateFrom, amountFrom, doCalculation])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted">
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Currency Converter
                        </CardTitle>
                        <p className="text-muted-foreground">
                            Real-time exchange rates from National Bank of Poland
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <CurrenciesHeader currencies={currencies}></CurrenciesHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <CurrenciesSelect currencies={currencies} selected={selectedFrom} onChange={handleChangeFrom} midRate={midRateFrom} label={t("from")}></CurrenciesSelect>
                            </div>

                            <div className="space-y-2">
                                <CurrenciesSelect currencies={currencies} selected={selectedTo} onChange={handleChangeTo} midRate={midRateTo} label={t("to")}></CurrenciesSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t("amount")}
                                </label>
                                <Input
                                    type="number"
                                    value={amountFrom}
                                    onChange={handleAmountFrom}
                                    className="w-full text-lg p-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t("value_in_selected_currency")}
                                </label>
                                <div className="w-full rounded-lg border border-input bg-background px-4 py-6 text-lg ring-offset-background">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            {amountFrom} {selectedFrom}
                                        </span>
                                        <Badge variant="secondary" className="text-lg px-3 py-1">=</Badge>
                                        <span className="font-bold text-2xl text-primary">
                                            {amountTo.toFixed(2)} {selectedTo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <ChartButton fromCurrency={selectedFrom} toCurrency={selectedTo} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App
