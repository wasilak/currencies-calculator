export const CurrenciesHeader = ({ currencies }: any) => {
    return (
        <div>
            {currencies &&
                <div className="small-12 columns">
                    <span className="label right">Stan na dzień: {currencies.data.effectiveDate}</span>
                </div>
            }
        </div>
    );
}
