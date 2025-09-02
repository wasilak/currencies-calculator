import { useState, useEffect } from "react"
import { BarChart3 } from "lucide-react"
import { Button } from "./ui/button"
import { Modal } from "./ui/modal"
import PrometheusChart from "./prometheus-chart"
import { checkPrometheusEnabled } from "../lib/api"
import { useTranslation } from "react-i18next"

interface ChartButtonProps {
    fromCurrency: string
    toCurrency: string
}

const ChartButton = ({ fromCurrency, toCurrency }: ChartButtonProps) => {
    const { t } = useTranslation()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkFeature = async () => {
            try {
                const enabled = await checkPrometheusEnabled()
                setIsEnabled(enabled)
            } catch (error) {
                console.log('Chart feature not available:', error)
                setIsEnabled(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkFeature()
    }, [])

    if (isLoading || !isEnabled) {
        return null
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
            >
                <BarChart3 className="h-4 w-4" />
                {t("chart")}
            </Button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t("currency_rate_history")}
            >
                <PrometheusChart fromCurrency={fromCurrency} toCurrency={toCurrency} hideTitle={true} />
            </Modal>
        </>
    )
}

export default ChartButton
