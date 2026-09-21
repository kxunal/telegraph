'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Activity, Globe, MessageSquare, Image as ImageIcon,
    Video, FileText, ArrowLeft, RefreshCw, HardDrive
} from 'lucide-react';

interface StatsData {
    totalUploads: number;
    totalUsers: number;
    webUploads: number;
    botUploads: number;
    totalImages: number;
    totalVideos: number;
}

export default function Analytics() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/analytics');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                fontWeight: '500'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ marginRight: '8px' }}
                >
                    <RefreshCw size={20} />
                </motion.div>
                Loading telemetry...
            </div>
        );
    }

    const totalDocs = (data?.totalUploads ?? 0) - (data?.totalImages ?? 0) - (data?.totalVideos ?? 0);
    const imagePercentage = data?.totalUploads ? Math.round((data.totalImages / data.totalUploads) * 100) : 0;
    const videoPercentage = data?.totalUploads ? Math.round((data.totalVideos / data.totalUploads) * 100) : 0;
    const docPercentage = data?.totalUploads ? Math.round((Math.max(0, totalDocs) / data.totalUploads) * 100) : 0;

    const webPercentage = data?.totalUploads ? Math.round((data.webUploads / data.totalUploads) * 100) : 0;
    const botPercentage = data?.totalUploads ? Math.round((data.botUploads / data.totalUploads) * 100) : 0;

    return (
        <main style={{
            minHeight: '100vh',
            padding: '5rem 2rem 4rem',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <header style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem', fontWeight: '500' }}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>Real-time telemetry and edge activity stats.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="lg-button"
                        style={{
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: 'auto',
                            marginTop: 0
                        }}
                    >
                        <motion.div
                            animate={refreshing ? { rotate: 360 } : {}}
                            transition={refreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                        >
                            <RefreshCw size={14} />
                        </motion.div>
                        Refresh
                    </button>
                </div>
            </header>

            {/* Stats Overview Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="history-card"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Uploads</span>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                            <Activity size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{data?.totalUploads ?? 0}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Files hosted on edge network</p>
                </motion.div>

                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="history-card"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Users Active</span>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(96, 165, 250, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)' }}>
                            <Globe size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{data?.totalUsers ?? 0}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Active API consumers</p>
                </motion.div>

                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="history-card"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Web Uploads</span>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                            <HardDrive size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{data?.webUploads ?? 0}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Uploads via web frontend</p>
                </motion.div>

                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="history-card"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>API Uploads</span>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(236, 72, 153, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                            <MessageSquare size={18} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{data?.botUploads ?? 0}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Uploads via API & automation</p>
                </motion.div>
            </div>

            {/* Split Visual Charts Panel */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                {/* Media Distribution Chart */}
                <div className="upload-card" style={{ padding: '2rem', margin: 0 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Media Type Distribution</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Images Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><ImageIcon size={14} /> Images</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{data?.totalImages ?? 0} ({imagePercentage}%)</span>
                            </div>
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${imagePercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: '100px' }}
                                />
                            </div>
                        </div>

                        {/* Videos Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Video size={14} /> Videos / GIFs</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{data?.totalVideos ?? 0} ({videoPercentage}%)</span>
                            </div>
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${videoPercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                    style={{ height: '100%', background: 'var(--accent-secondary)', borderRadius: '100px' }}
                                />
                            </div>
                        </div>

                        {/* Documents Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><FileText size={14} /> Documents / Snippets</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{Math.max(0, totalDocs)} ({docPercentage}%)</span>
                            </div>
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${docPercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                    style={{ height: '100%', background: '#10b981', borderRadius: '100px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Channel Split */}
                <div className="upload-card" style={{
                    padding: '2rem',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Upload Channel Split</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Traffic comparison between the API integrations and the Web frontend.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
                        {/* Custom visual donut ring using SVG */}
                        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="12" />
                                {data?.totalUploads ? (
                                    <>
                                        <motion.circle
                                            cx="60" cy="60" r="50" fill="transparent" stroke="#10b981" strokeWidth="12"
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - webPercentage / 100) }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                        <motion.circle
                                            cx="60" cy="60" r="50" fill="transparent" stroke="#ec4899" strokeWidth="12"
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - botPercentage / 100) }}
                                            style={{ transformOrigin: '60px 60px', transform: `rotate(${3.6 * webPercentage}deg)` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                                        />
                                    </>
                                ) : null}
                            </svg>
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                            }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{webPercentage}%</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '600' }}>Web</span>
                            </div>
                        </div>

                        {/* Legends */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10b981' }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Web Portal ({data?.webUploads ?? 0})</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct desktop/mobile client drops</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#ec4899' }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>API / Automations ({data?.botUploads ?? 0})</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uploads via API endpoints or developer scripts</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </main>
    );
}
