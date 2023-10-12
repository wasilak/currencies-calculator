// import { FunctionComponent, useState } from 'react';
import { Model, Rate } from "./models"
import { useTranslation } from "react-i18next";
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';

// type CurrenciesSelectProps = {
//     currencies: Model,
// }


// export const CurrenciesSelect: FunctionComponent<CurrenciesSelectProps> = ({ currencies, selected, handleChange }) => {
export const CurrenciesSelect = ({ currencies, selected, onChange, midRate, label }: any) => {
    const { t } = useTranslation();

    const uniqueId = (Date.now() * Math.random()).toString();

    return (
        <Box>
            <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel id={uniqueId}>{label}</InputLabel>
                <Select
                    labelId={uniqueId}
                    value={selected}
                    label={label}
                    onChange={onChange}
                >
                    {currencies &&
                        currencies.data.rates.map(function (rate: Rate) {
                            return (
                                <MenuItem key={rate.code} value={rate.code}>{rate.code} - {rate.currency}</MenuItem>
                            );
                        })
                    }
                </Select>
            </FormControl>

            <Chip label={`${t("mid_rate")}: ${midRate} PLN`} color="primary" variant="outlined" />
        </Box>
    );
}
