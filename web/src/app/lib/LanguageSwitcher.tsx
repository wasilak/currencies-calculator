import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (newLang: string) => {
        i18n.changeLanguage(newLang);
    };

    return (
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pl">Polish</SelectItem>
            </SelectContent>
        </Select>
    );
};

export default LanguageSwitcher;
