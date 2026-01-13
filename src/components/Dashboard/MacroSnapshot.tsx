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
                    <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', marginTop: '4px' }}>
                        {country.region} {country.developmentStatus && <><span style={{ opacity: 0.3 }}>•</span> {country.developmentStatus}</>}
                    </div>
                </div>

            </div>
        </div>
    );
};
