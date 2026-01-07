import { Country } from '../../types';



// Note: data prop was unused, simplified to only take country
export const MacroSnapshot = ({ country }: { country: Country, data?: any }) => {
    return (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div className="text-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {country.name}
                    </div>
                    <div className="text-sm text-muted">{country.region}</div>
                </div>

            </div>
        </div>
    );
};
