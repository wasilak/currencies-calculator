import { useTranslation } from "react-i18next";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const uniqueId = (Date.now() * Math.random()).toString();

    const handleLanguageChange = (e: any) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
    };

    return (
        <FormControl fullWidth size="small">
            <InputLabel id={uniqueId}>Language</InputLabel>
            <Select
                id="languageSwitcher"
                value={i18n.language}
                labelId={uniqueId}
                label="Language"
                onChange={handleLanguageChange}
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="pl">Polish</MenuItem>
            </Select>
        </FormControl>
    );
};

export default LanguageSwitcher;
