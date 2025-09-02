import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui/badge";
import { ThemeSwitcher } from "../components/theme-switcher";

export const CurrenciesHeader = ({ currencies }: any) => {
    const { t } = useTranslation();

    return (
        <div className="flex justify-between items-center gap-4">
            {currencies && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    {t("effective_date")}: {currencies.data.effectiveDate}
                </Badge>
            )}
            <div className="flex gap-2">
                <ThemeSwitcher />
                <div className="w-32">
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
}
