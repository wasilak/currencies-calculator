import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e: any) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
    };

    return (
        <select className="right" value={i18n.language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="pl">Polski</option>
        </select>
    );
};

export default LanguageSwitcher;
