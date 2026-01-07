import { Country, MacroIndicator } from '../../types';

interface MacroSnapshotProps {
    country: Country;
    data: MacroIndicator;
}

export const MacroSnapshot = ({ country, data }: MacroSnapshotProps) => {
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
