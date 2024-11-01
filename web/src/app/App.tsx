import { useState, useEffect, useCallback } from "react";
import { CurrenciesSelect } from "./lib/CurrenciesSelect"
import { CurrenciesHeader } from "./lib/CurrenciesHeader"
import { Model, WalutaPL, Rate } from "./lib/models"
import { GetCurrencies } from "./lib/api"
import LanguageDetector from 'i18next-browser-languagedetector';

import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { initReactI18next } from "react-i18next";
import Translations from "./lib/locales";

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import LoaderComponent from "./lib/Loader";

const defaultTheme = createTheme();

const resources = Translations()

const defaultCurrency = WalutaPL.code;

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
        if (currencies) {
            return currencies.data.rates.filter((value: Rate) => {
                return value.code == selected;
            })[0].mid;
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
        <ThemeProvider theme={defaultTheme}>
            <LoaderComponent>
                <Container component="main" maxWidth="sm" sx={{ mt: 2 }}>
                    <CssBaseline />
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <CurrenciesHeader currencies={currencies}></CurrenciesHeader>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <CurrenciesSelect currencies={currencies} selected={selectedFrom} onChange={handleChangeFrom} midRate={midRateFrom} label={t("from")}></CurrenciesSelect>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <CurrenciesSelect currencies={currencies} selected={selectedTo} onChange={handleChangeTo} midRate={midRateTo} label={t("to")}></CurrenciesSelect>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <TextField fullWidth label={t("amount")} variant="outlined" value={amountFrom} onChange={handleAmountFrom} />
                        </Box>

                        <Box>
                            <TextField fullWidth disabled label={t("value_in_selected_currency")} variant="outlined" value={`${amountFrom} ${selectedFrom} = ${amountTo} ${selectedTo}`} />
                        </Box>
                    </Box>
                </Container>
            </LoaderComponent>
        </ThemeProvider>

    );
}

export default App
