import { Rate } from "./models"
import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Badge } from "../components/ui/badge"

export const CurrenciesSelect = ({ currencies, selected, onChange, midRate, label }: any) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>
            <Select value={selected} onValueChange={(value) => onChange({ target: { value } })}>
                <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                    {currencies &&
                        currencies.data.rates.map(function (rate: Rate) {
                            return (
                                <SelectItem key={rate.code} value={rate.code}>
                                    {rate.code} - {rate.currency}
                                </SelectItem>
                            );
                        })
                    }
                </SelectContent>
            </Select>

            <Badge variant="secondary" className="w-full justify-center py-2 text-base">
                {t("mid_rate")}: {midRate} PLN
            </Badge>
        </div>
    );
}
