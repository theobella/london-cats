import React, { useMemo, useState } from 'react';
import { CATS, calculateDaysWaiting } from '../data/mockData';
import CatModal from '../components/CatModal';

const Metrics = () => {
    const [filters, setFilters] = useState({});
    const [selectedCat, setSelectedCat] = useState(null);

    const handleFilterToggle = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            if (current === value) {
                const { [category]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [category]: value };
        });
    };

    const filteredCats = useMemo(() => {
        return CATS.filter(cat => {
            for (const [key, value] of Object.entries(filters)) {
                if (key === 'waitTimeBucket') {
                    const days = calculateDaysWaiting(cat.dateListed, cat.dateReserved);
                    if (value === '< 1 Week' && days >= 7) return false;
                    if (value === '1-2 Weeks' && (days < 7 || days >= 14)) return false;
                    if (value === '2-4 Weeks' && (days < 14 || days >= 30)) return false;
                    if (value === '1 Month+' && days < 30) return false;
                } else {
                    const catValue = cat[key] || 'Unknown';
                    if (catValue !== value) return false;
                }
            }
            return true;
        });
    }, [filters]);

    const stats = useMemo(() => {
        const total = CATS.length;
        const available = CATS.filter(c => c.status === 'Available').length;
        const reserved = CATS.filter(c => c.status === 'Reserved').length;

        // Calculate Average Wait Time for Available Cats
        const availableCats = CATS.filter(c => c.status === 'Available');
        const totalWaitDays = availableCats.reduce((sum, cat) => sum + calculateDaysWaiting(cat.dateListed, null), 0);
        const avgWaitTime = availableCats.length ? Math.round(totalWaitDays / availableCats.length) : 0;

        // Time to Reserve (for Reserved cats)
        const reservedCats = CATS.filter(c => c.status === 'Reserved' && c.dateReserved);
        const totalReserveTime = reservedCats.reduce((sum, cat) => sum + calculateDaysWaiting(cat.dateListed, cat.dateReserved), 0);
        const avgReserveTime = reservedCats.length ? Math.round(totalReserveTime / reservedCats.length) : 0;

        return { total, available, reserved, avgWaitTime, avgReserveTime };
    }, []);

    // Grouping Helpers (Unfiltered for overview charts, or filtered? Usually overview charts show everything, interactive drilling down filters the table)
    // Let's keep charts showing GLOBAL stats to act as controls.
    const getGroupCounts = (field) => {
        const counts = {};
        CATS.forEach(c => {
            const val = c[field] || 'Unknown';
            counts[val] = (counts[val] || 0) + 1;
        });
        return counts;
    };

    const navi = (days) => {
        if (days < 7) return '< 1 Week';
        if (days < 14) return '1-2 Weeks';
        if (days < 30) return '2-4 Weeks';
        return '1 Month+';
    }

    const waitTimeCounts = {};
    CATS.filter(c => c.status === 'Available').forEach(c => {
        const days = calculateDaysWaiting(c.dateListed, null);
        const bucket = navi(days);
        waitTimeCounts[bucket] = (waitTimeCounts[bucket] || 0) + 1;
    });

    const ageCounts = getGroupCounts('ageCategory');
    const genderCounts = getGroupCounts('gender');
    const sourceCounts = getGroupCounts('sourceType');

    const renderBarChart = (data, title, category) => {
        const max = Math.max(...Object.values(data));
        return (
            <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: 1, minWidth: '300px' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(data).map(([label, count]) => {
                        const isActive = filters[category] === label;
                        return (
                            <div
                                key={label}
                                onClick={() => handleFilterToggle(category, label)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    opacity: (Object.keys(filters).length === 0 || isActive || !filters[category]) ? 1 : 0.4,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <span style={{ width: '100px', fontWeight: 500 }}>{label}</span>
                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.05)', borderRadius: '4px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(count / max) * 100}%`,
                                        background: isActive ? 'var(--color-secondary)' : 'var(--color-primary)',
                                        height: '100%',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }}></div>
                                </div>
                                <span style={{ width: '40px', textAlign: 'right', fontWeight: 600 }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ paddingBottom: 'var(--spacing-2xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Adoption Metrics & Insights</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Real-time analysis of London's cat rescue ecosystem.</p>
                {Object.keys(filters).length > 0 && (
                    <button
                        onClick={() => setFilters({})}
                        style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--color-text-muted)', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <KPICard title="Total Cats Tracking" value={stats.total} />
                <KPICard title="Avg Days Waiting" value={`${stats.avgWaitTime} Days`} subtitle="For available cats" />
                <KPICard title="Avg Time to Reserve" value={stats.avgReserveTime > 0 ? `${stats.avgReserveTime} Days` : "N/A"} subtitle="Speed of adoption" />
                <KPICard title="Adoption Rate" value={`${Math.round((stats.reserved / stats.total) * 100)}%`} subtitle={`${stats.reserved} reserved`} />
            </div>

            {/* Daily Activity Chart */}
            <ActivityChart cats={CATS} />

            {/* Charts Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                {renderBarChart(sourceCounts, 'By Rescue Type', 'sourceType')}
                {renderBarChart(ageCounts, 'Age Demographics', 'ageCategory')}
                {renderBarChart(genderCounts, 'Gender Split', 'gender')}
                {renderBarChart(waitTimeCounts, 'Wait Time Distribution (Available)', 'waitTimeBucket')}
            </div>

            {/* Detailed Table */}
            <div className="glass-card" style={{ padding: 'var(--spacing-xl)', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>Detailed Dataset ({filteredCats.length} cats)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', textAlign: 'left' }}>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Rescue</th>
                            <th style={thStyle}>Age Cat.</th>
                            <th style={thStyle}>Color</th>
                            <th style={thStyle}>Indoor?</th>
                            <th style={thStyle}>Health</th>
                            <th style={thStyle}>Date Listed</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Wait Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCats.map(cat => {
                            const waitTime = calculateDaysWaiting(cat.dateListed, cat.dateReserved);
                            return (
                                <tr
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat)}
                                    style={{
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="table-row-hover"
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={cat.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                            {cat.name}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{cat.sourceId === 'battersea' ? 'Battersea' : 'Cats Protection'}</td>
                                    <td style={tdStyle}>{cat.ageCategory || 'Unknown'}</td>
                                    <td style={tdStyle}>{cat.color || 'Unknown'}</td>
                                    <td style={tdStyle}>
                                        <span className={`badge ${cat.environment === 'Indoor-Only' ? 'badge-primary' : 'badge-secondary'}`}>
                                            {cat.environment || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{cat.health || 'Unknown'}</td>
                                    <td style={tdStyle}>{new Date(cat.dateListed).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: cat.status === 'Reserved' ? '#E07A5F' : '#81B29A',
                                            fontWeight: 600
                                        }}>
                                            {cat.status}
                                        </span>
                                    </td>
                                    <td style={tdStyle}><strong>{waitTime} Days</strong></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedCat && (
                <CatModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
            )}
        </div>
    );
};

const KPICard = ({ title, value, subtitle }) => (
    <div className="glass-card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{subtitle}</div>}
    </div>
);

const thStyle = { padding: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 };
const tdStyle = { padding: '12px', fontSize: '0.95rem' };

const ActivityChart = ({ cats }) => {
    const dailyStats = useMemo(() => {
        const stats = {};
        cats.forEach(cat => {
            if (cat.dateListed) {
                const date = cat.dateListed.split('T')[0];
                if (!stats[date]) stats[date] = { added: 0, reserved: 0 };
                stats[date].added++;
            }
            if (cat.dateReserved) {
                const date = cat.dateReserved.split('T')[0];
                if (!stats[date]) stats[date] = { added: 0, reserved: 0 };
                stats[date].reserved++;
            }
        });
        return Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0])).slice(-14); // Last 14 days
    }, [cats]);

    const maxVal = Math.max(...dailyStats.map(([, d]) => Math.max(d.added, d.reserved)), 1); // Avoid div by zero

    return (
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Daily Activity (Last 14 Days)</h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--color-secondary)', borderRadius: '2px' }}></div>
                        <span>Added</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
                        <span>Reserved</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '2%', paddingTop: '20px' }}>
                {dailyStats.map(([date, data]) => (
                    <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', width: '100%', justifyContent: 'center' }}>
                            <div
                                style={{
                                    width: '30%',
                                    height: `${(data.added / maxVal) * 100}%`,
                                    background: 'var(--color-secondary)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.5s ease',
                                    minHeight: data.added > 0 ? '4px' : '0'
                                }}
                                title={`${data.added} Added`}
                            />
                            <div
                                style={{
                                    width: '30%',
                                    height: `${(data.reserved / maxVal) * 100}%`,
                                    background: 'var(--color-primary)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.5s ease',
                                    minHeight: data.reserved > 0 ? '4px' : '0'
                                }}
                                title={`${data.reserved} Reserved`}
                            />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            marginTop: '8px',
                            color: 'var(--color-text-muted)',
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'top left',
                            whiteSpace: 'nowrap'
                        }}>
                            {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                ))}
                {dailyStats.length === 0 && (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-muted)', alignSelf: 'center' }}>No activity data available yet.</div>
                )}
            </div>
        </div>
    );
};

export default Metrics;
