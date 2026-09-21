'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Copy, Check, QrCode, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';


export default function Home() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ id: string; url: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [customId, setCustomId] = useState('');
    const [expiration, setExpiration] = useState('never');
    const [password, setPassword] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [mode, setMode] = useState<'media' | 'text'>('media');
    const [textContent, setTextContent] = useState('');
    
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--gx', `${x}px`);
        e.currentTarget.style.setProperty('--gy', `${y}px`);
    };

    const copyToClipboard = (text: string) => {
        const performCopy = () => {
            setCopied(true);
            setShowToast(true);
            setTimeout(() => {
                setCopied(false);
                setShowToast(false);
            }, 2000);
        };

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(performCopy);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            performCopy();
            document.body.removeChild(textArea);
        }
    };

    const uploadFile = async (file?: File) => {
        let uploadTarget: File;
        
        if (mode === 'text') {
            if (!textContent.trim()) {
                alert('Please enter some text');
                return;
            }
            const blob = new Blob([textContent], { type: 'text/plain' });
            uploadTarget = new File([blob], 'snippet.txt', { type: 'text/plain' });
        } else {
            if (!file) return;
            const safeName = encodeURIComponent(file.name);
            uploadTarget = new File([file], safeName, { type: file.type });
        }

        // Vercel Serverless Function body size limit is 4.5MB
        if (uploadTarget.size > 4.5 * 1024 * 1024) {
            alert('File too large. Vercel limits uploads to 4.5MB.');
            return;
        }

        setUploading(true);
        setResult(null);
        setShowQr(false);

        const formData = new FormData();
        formData.append('file', uploadTarget);
        if (customId) formData.append('customId', customId);
        if (password) formData.append('password', password);
        formData.append('expiration', expiration);

        try {
            const response = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 413) {
                throw new Error('File too large. Vercel serverless limit is 4.5MB.');
            }

            let json;
            try {
                json = await response.json();
            } catch (e) {
                throw new Error(`Upload failed (Server returned status ${response.status})`);
            }

            if (!json.success) throw new Error(json.error.message);

            const data = json.data;
            setResult(data);
            setCustomId('');
            setPassword('');
            setExpiration('never');
            setTextContent('');
        } catch (err: any) {
            alert(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) uploadFile(file);
    };

    return (
        <>
            <nav>
                <Link href="/" className="logo">
                    Telegraph
                </Link>
                <div className="nav-links">
                    <Link href="/analytics">Dashboard</Link>
                    <Link href="/docs">API</Link>
                </div>
            </nav>

            <main className="main-container">
                <div className="eyebrow">Edge-hosted · zero clutter</div>
                <h1>Drop it in. <span className="accent">Glow</span> it out.</h1>
                <p className="sub">Telegraph keeps your images, clips, and files light — instantly delivered from the edge, beautifully out of your way.</p>


                <div className="tabs">
                    <div 
                        className={`tab ${mode === 'media' ? 'active' : ''}`}
                        onClick={() => { setMode('media'); setResult(null); }}
                    >
                        Media
                    </div>
                    <div 
                        className={`tab ${mode === 'text' ? 'active' : ''}`}
                        onClick={() => { setMode('text'); setResult(null); }}
                    >
                        Text snippet
                    </div>
                </div>

                <div className="upload-card" ref={cardRef} onMouseMove={handleMouseMove}>
                    {mode === 'media' ? (
                        <div
                            className={`drop-zone ${isDragging ? 'active' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="file-input"
                                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                            />

                            <div className="upload-icon-container">☁️</div>

                            <div className="upload-text">
                                <h3>{uploading ? 'Glow-loading...' : 'Drop a file here'}</h3>
                                <p>{uploading ? 'Uploading at the edge' : 'or click to browse — images, video, anything'}</p>
                            </div>

                            {uploading && (
                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ position: 'relative', textAlign: 'left' }}>
                            <textarea
                                className="lg-input"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Paste your text or code here..."
                                style={{ minHeight: '200px', resize: 'vertical' }}
                            />
                            <button
                                className="lg-button"
                                onClick={() => uploadFile()}
                                disabled={uploading || !textContent.trim()}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {uploading ? 'Publishing...' : 'Publish Text'}
                            </button>
                        </div>
                    )}

                    {/* Show advanced options */}
                    <div style={{ margin: '14px 0 6px' }}>
                        <span className="advanced-link" onClick={() => setShowAdvanced(!showAdvanced)}>
                            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
                        </span>
                    </div>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    marginTop: '12px',
                                    padding: '16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    textAlign: 'left'
                                }}>
                                    {/* Custom ID Input */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom File Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="lg-input"
                                            placeholder="custom-name"
                                            value={customId}
                                            onChange={(e) => setCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                        />
                                    </div>

                                    {/* Expiration Dropdown */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiration</label>
                                        <select
                                            className="lg-input"
                                            value={expiration}
                                            onChange={(e) => setExpiration(e.target.value)}
                                        >
                                            <option value="never">Never (Keep Forever)</option>
                                            <option value="1view">1 View (Self-destruct)</option>
                                            <option value="10mins">10 Minutes</option>
                                            <option value="1hour">1 Hour</option>
                                            <option value="1day">1 Day</option>
                                        </select>
                                    </div>

                                    {/* Password Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password Protection (Optional)</label>
                                        <input
                                            type="password"
                                            className="lg-input"
                                            placeholder="Set access password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Result area */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                className="result-area"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="link-box">
                                    <span className="link-text">{result.url}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: 'var(--ink)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '10px',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => setShowQr(!showQr)}
                                        >
                                            <QrCode size={16} />
                                        </button>
                                        <button 
                                            className="copy-btn" 
                                            onClick={() => copyToClipboard(result.url)}
                                            style={{
                                                padding: '8px 14px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {showQr && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            marginTop: '1.25rem',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            background: 'white',
                                            padding: '1.25rem',
                                            borderRadius: '20px',
                                            boxShadow: '0 8px 24px rgba(58, 46, 42, 0.08)',
                                            border: '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <QRCodeSVG value={result.url} size={150} />
                                    </motion.div>
                                )}

                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <a href={result.url} target="_blank" style={{ color: 'var(--coral)', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                        View Live Link <ExternalLink size={12} />
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>



                <footer className="footer">
                    <div>Telegraph &copy; {new Date().getFullYear()} — Soft, Fast Media Hosting</div>
                </footer>

                {/* Toast Notification System */}
                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            style={{
                                position: 'fixed',
                                bottom: '3rem',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--glass-border)',
                                padding: '12px 24px',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 8px 32px rgba(58, 46, 42, 0.08)',
                                zIndex: 1000,
                                color: 'var(--ink)'
                            }}
                        >
                            <div style={{ background: 'var(--coral)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                                <Check size={12} color="white" strokeWidth={3} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Copied to clipboard</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}
