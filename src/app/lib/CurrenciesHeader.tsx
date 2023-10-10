import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const CurrenciesHeader = ({ currencies }: any) => {
    const { t } = useTranslation();

    return (
        <div className="row">
            {currencies &&
                <div className="small-8 columns">
                    <span className="label left">{t("effective_date")}: {currencies.data.effectiveDate}</span>
                </div>
            }
            <div className="small-4 columns">
                <LanguageSwitcher />
            </div>
        </div>
    );
}
