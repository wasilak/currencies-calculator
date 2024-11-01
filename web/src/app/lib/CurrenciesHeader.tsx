import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

export const CurrenciesHeader = ({ currencies }: any) => {
    const { t } = useTranslation();

    return (
        <Grid container justifyContent="space-between">
            {currencies &&
                <Grid item>
                    <Chip label={`${t("effective_date")}: ${currencies.data.effectiveDate}`} color="success" variant="outlined" />
                </Grid>
            }
            <Grid item>
                <LanguageSwitcher />
            </Grid>
        </Grid>
    );
}
