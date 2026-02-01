import React, { useMemo, useState } from 'react';
import { CATS, calculateDaysWaiting } from '../data/mockData';
import CatModal from '../components/CatModal';

const Metrics = () => {
    const [filters, setFilters] = useState({});
    const [activityFilters, setActivityFilters] = useState([]); // Array of { date, type }
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

    const toggleActivityFilter = (date, type) => {
        setActivityFilters(prev => {
            const exists = prev.find(f => f.date === date && f.type === type);
            if (exists) {
                return prev.filter(f => f.date !== date || f.type !== type);
            }
            return [...prev, { date, type }];
        });
    };

    const matchesFilters = (cat, excludeKey = null, ignoreActivity = false) => {
        // Standard Filters
        for (const [key, value] of Object.entries(filters)) {
            if (key === excludeKey) continue;
            if (key === 'waitTimeBucket') {
                const days = calculateDaysWaiting(cat.dateListed, cat.dateReserved || cat.dateAdopted);
                if (value === '< 1 Week' && days >= 7) return false;
                if (value === '1-2 Weeks' && (days < 7 || days >= 14)) return false;
                if (value === '2-4 Weeks' && (days < 14 || days >= 30)) return false;
                if (value === '1 Month+' && days < 30) return false;
            } else {
                let catValue = cat[key] || 'Unknown';
                if (key === 'sourceId') {
                    if (catValue === 'battersea') catValue = 'Battersea';
                    else if (catValue === 'cats_protection') catValue = 'Cats Protection';
                    else if (catValue === 'lick') catValue = 'L.I.C.K.';
                }
                if (catValue !== value) return false;
            }
        }

        // Activity Filter
        if (!ignoreActivity && activityFilters.length > 0) {
            const matchesActivity = activityFilters.some(filter => {
                const { date, type } = filter;
                if (type === 'added') {
                    return cat.dateListed && cat.dateListed.split('T')[0] === date;
                }
                if (type === 'reserved') {
                    return cat.dateReserved && cat.dateReserved.split('T')[0] === date;
                }
                return false;
            });
            if (!matchesActivity) return false;
        }

        return true;
    };

    const filteredCats = useMemo(() => {
        return CATS.filter(cat => matchesFilters(cat));
    }, [filters, activityFilters]);

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

    // Cross-filtered Chart Data
    const getChartCounts = (field) => {
        const counts = {};
        // Filter by everything EXCEPT this field
        const relevantCats = CATS.filter(cat => matchesFilters(cat, field));
        relevantCats.forEach(c => {
            // Special handling for rescue Name mapping
            let val = c[field] || 'Unknown';
            if (field === 'sourceId') {
                if (val === 'battersea') val = 'Battersea';
                else if (val === 'cats_protection') val = 'Cats Protection';
                else if (val === 'lick') val = 'L.I.C.K.';
            }
            counts[val] = (counts[val] || 0) + 1;
        });
        return counts;
    };

    // Activity Chart Data (Respects filters, ignores activity selection to show context)
    const activityChartCats = useMemo(() => {
        return CATS.filter(cat => matchesFilters(cat, null, true));
    }, [filters]);

    const navi = (days) => {
        if (days < 7) return '< 1 Week';
        if (days < 14) return '1-2 Weeks';
        if (days < 30) return '2-4 Weeks';
        return '1 Month+';
    }

    const waitTimeCounts = {};
    // For Wait Time chart, we exclude 'waitTimeBucket' from filters
    CATS.filter(cat => matchesFilters(cat, 'waitTimeBucket')).filter(c => c.status === 'Available').forEach(c => {
        const days = calculateDaysWaiting(c.dateListed, null);
        const bucket = navi(days);
        waitTimeCounts[bucket] = (waitTimeCounts[bucket] || 0) + 1;
    });

    const ageCounts = getChartCounts('ageCategory');
    const genderCounts = getChartCounts('gender');
    const sourceCounts = getChartCounts('sourceType');
    const rescueNameCounts = getChartCounts('sourceId');
    const envCounts = getChartCounts('environment');

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
                {(Object.keys(filters).length > 0 || activityFilters.length > 0) && (
                    <button
                        onClick={() => { setFilters({}); setActivityFilters([]); }}
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
            <ActivityChart cats={activityChartCats} filters={activityFilters} onToggle={toggleActivityFilter} />

            {/* Charts Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                {renderBarChart(rescueNameCounts, 'By Rescue', 'sourceId')}
                {renderBarChart(sourceCounts, 'Rescue Type', 'sourceType')}
                {renderBarChart(ageCounts, 'Age Demographics', 'ageCategory')}
                {renderBarChart(genderCounts, 'Gender Split', 'gender')}
                {renderBarChart(envCounts, 'Environment', 'environment')}
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
                            const waitTime = calculateDaysWaiting(cat.dateListed, cat.dateReserved || cat.dateAdopted);
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
                                    <td style={tdStyle}>
                                        {(() => {
                                            if (cat.sourceId === 'battersea') return 'Battersea';
                                            if (cat.sourceId === 'cats_protection') return 'Cats Protection';
                                            if (cat.sourceId === 'lick') return 'L.I.C.K.';
                                            return cat.sourceId || 'Unknown';
                                        })()}
                                    </td>
                                    <td style={tdStyle}>{cat.ageCategory || 'Unknown'}</td>
                                    <td style={tdStyle}>{cat.color || 'Unknown'}</td>
                                    <td style={tdStyle}>
                                        <span className={`badge ${cat.environment === 'Indoor-Only' ? 'badge-primary' : (cat.environment === 'Outdoor Access' ? 'badge-secondary' : 'badge-neutral')}`}>
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

const ActivityChart = ({ cats, filters, onToggle }) => {
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
        return Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
    }, [cats]);

    const maxVal = Math.max(...dailyStats.map(([, d]) => Math.max(d.added, d.reserved)), 1);

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
                {dailyStats.map(([date, data]) => {
                    const isAddedActive = filters.some(f => f.date === date && f.type === 'added');
                    const isReservedActive = filters.some(f => f.date === date && f.type === 'reserved');
                    const hasFilters = filters.length > 0;

                    return (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', width: '100%', justifyContent: 'center' }}>
                                <div
                                    onClick={() => onToggle(date, 'added')}
                                    style={{
                                        width: '30%',
                                        height: `${(data.added / maxVal) * 100}%`,
                                        background: 'var(--color-secondary)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s ease',
                                        minHeight: data.added > 0 ? '4px' : '0',
                                        cursor: 'pointer',
                                        opacity: (!hasFilters || isAddedActive) ? 1 : 0.3,
                                        border: isAddedActive ? '2px solid #333' : 'none',
                                        position: 'relative'
                                    }}
                                    title={`${data.added} Added`}
                                >
                                    {data.added > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '2px'
                                        }}>
                                            {data.added}
                                        </span>
                                    )}
                                </div>
                                <div
                                    onClick={() => onToggle(date, 'reserved')}
                                    style={{
                                        width: '30%',
                                        height: `${(data.reserved / maxVal) * 100}%`,
                                        background: 'var(--color-primary)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s ease',
                                        minHeight: data.reserved > 0 ? '4px' : '0',
                                        cursor: 'pointer',
                                        opacity: (!hasFilters || isReservedActive) ? 1 : 0.3,
                                        border: isReservedActive ? '2px solid #333' : 'none',
                                        position: 'relative'
                                    }}
                                    title={`${data.reserved} Reserved`}
                                >
                                    {data.reserved > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '2px'
                                        }}>
                                            {data.reserved}
                                        </span>
                                    )}
                                </div>
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
                    );
                })}
                {dailyStats.length === 0 && (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-muted)', alignSelf: 'center' }}>No activity data available yet.</div>
                )}
            </div>
            {filters.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Filtering by {filters.length} selected activities
                </div>
            )}
        </div>
    );
};

export default Metrics;
