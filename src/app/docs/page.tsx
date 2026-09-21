'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type Language = 'bash' | 'python' | 'javascript' | 'go';

export default function Docs() {
    const [copied, setCopied] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('');
    const [activeLang, setActiveLang] = useState<Language>('bash');
        
    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const copyCode = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const snippets = {
        bash: `curl -X POST ${baseUrl || 'http://localhost:3000'}/api/v1/upload \\
  -F "file=@/path/to/image.jpg" \\
  -F "customId=my-slug" \\
  -F "password=secret123" \\
  -F "expiration=24h"`,
        python: `import requests

url = "${baseUrl || 'http://localhost:3000'}/api/v1/upload"
files = {'file': open('image.jpg', 'rb')}
data = {
    'customId': 'my-slug',
    'password': 'secret123',
    'expiration': '24h'
}

response = requests.post(url, files=files, data=data)
print(response.json())`,
        javascript: `const formData = new FormData();
formData.append('file', imageFile);
formData.append('customId', 'my-slug');
formData.append('password', 'secret123');
formData.append('expiration', '24h');

const res = await fetch('${baseUrl || 'http://localhost:3000'}/api/v1/upload', {
  method: 'POST',
  body: formData
});

const data = await res.json();
console.log(data);`,
        go: `package main

import (
    "bytes"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

func main() {
    url := "${baseUrl || 'http://localhost:3000'}/api/v1/upload"
    // ... setup multipart/form-data request ...
    // Full example omitted for brevity
}`
    };

    const textSnippets = {
        bash: `curl -X POST ${baseUrl || 'http://localhost:3000'}/api/v1/upload \\
  -F "file=@/path/to/my_script.py" \\
  -F "customId=my-script" \\
  -F "password=secret123" \\
  -F "expiration=24h"`,
        python: `import requests

url = "${baseUrl || 'http://localhost:3000'}/api/v1/upload"
text_content = "Hello World! This is a simple test upload from my Python bot."

# CRITICAL: Send as 'snippet.txt' so the server knows it's a text file
files = {
    'file': ('snippet.txt', text_content, 'text/plain')
}
data = {
    'password': 'secret123',
    'expiration': '24h'
}

response = requests.post(url, files=files, data=data)
if response.status_code == 200:
    result = response.json()
    if result.get('success'):
        print(f"🌐 Link: {result.get('data', {}).get('url')}")`,
        javascript: `import axios from 'axios';
import FormData from 'form-data';

const form = new FormData();
// CRITICAL: Supply a .txt filename and text/plain content type
form.append('file', Buffer.from("Hello World!", 'utf-8'), {
    filename: 'snippet.txt',
    contentType: 'text/plain',
});
form.append('password', 'secret123');
form.append('expiration', '24h');

const response = await axios.post('${baseUrl || 'http://localhost:3000'}/api/v1/upload', form, {
    headers: form.getHeaders(),
});

if (response.data.success) {
    console.log('🌐 Link:', response.data.data.url);
}`,
        go: `package main

// CRITICAL: Submit the part with a '.txt' suffix in the filename parameter.
// Example: writer.CreateFormFile("file", "snippet.txt")
`
    };

    const responseExample = `{
  "success": true,
  "data": {
    "id": "my-slug",
    "url": "${baseUrl || 'https://telegraph.link'}/i/my-slug",
    "direct_url": "${baseUrl || 'https://telegraph.link'}/i/my-slug.jpg",
    "timestamp": 1705500000000
  }
}`;



    
    return (
        <main style={{
            minHeight: '100vh',
            padding: '5rem 2rem 4rem',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
            <header style={{ marginBottom: '3.5rem' }}>
                <Link href="/" style={{ color: 'var(--ink-dim)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--ink)', marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    API Documentation
                </h1>
                <p style={{ color: 'var(--ink-dim)', fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.6, maxWidth: '700px' }}>
                    The complete reference for integrating Telegraph into your applications. Fast, scalable, and decentralized.
                </p>
            </header>

            <style>{`
                .docs-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 2rem;
                    align-items: start;
                }
                .docs-col {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    min-width: 0;
                }
                @media (max-width: 900px) {
                    .docs-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <div className="docs-grid">
                <div className="docs-col">
                    <div className="upload-card" style={{ padding: '3rem 2.5rem', margin: 0, width: '100%' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--ink)', marginBottom: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>Getting Started</h2>
                            <p style={{ color: 'var(--ink-dim)', lineHeight: '1.8', marginBottom: '2rem', fontSize: '1.05rem' }}>
                                Telegraph provides a high-performance REST API for uploading and managing images, GIFs, and videos via our Telegram-backed edge storage.
                                Our storage is 100% free, decentralized, and infinitely scalable.
                            </p>
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.04)',
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <Zap color="var(--accent)" style={{ flexShrink: 0 }} />
                                <div>
                                    <h4 style={{ color: 'var(--ink)', marginBottom: '6px', fontWeight: '600' }}>Quick Start</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--ink-dim)', lineHeight: 1.6 }}>
                                        All API responses are in JSON format. Use the endpoints below to start building immediately.
                                    </p>
                                </div>
                                </div>
                            </div>
                    <div className="upload-card" style={{ padding: '3rem 2.5rem', margin: 0, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <span style={{ background: 'var(--accent)', color: 'white', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>POST</span>
                                <h2 style={{ fontSize: '2rem', color: 'var(--ink)', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>/api/v1/upload</h2>
                            </div>

                            <p style={{ color: 'var(--ink-dim)', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                                Upload images, videos, or GIFs. Returns a direct CDN link.
                            </p>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: '600' }}>Parameters (multipart/form-data)</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>file</b> <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>REQUIRED</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>The file buffer or payload to upload.</div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>customId</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>A custom slug for your URL instead of a random string.</div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>password</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Encrypt the link with a password. Only users with the password can decrypt and view it.</div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>expiration</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Self-destruct timer. Valid values: <code>1h</code>, <code>12h</code>, <code>24h</code>, <code>3d</code>, <code>1w</code>, <code>1m</code>, <code>never</code>.</div>
                                    </li>
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <div style={{ borderBottom: '1px solid var(--glass-border)', padding: '12px 20px', display: 'flex', gap: '1.5rem', overflowX: 'auto', alignItems: 'center' }}>
                                    {(['bash', 'python', 'javascript'] as Language[]).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveLang(lang)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: activeLang === lang ? 'var(--accent)' : 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                padding: '8px 0',
                                                borderBottom: activeLang === lang ? '2px solid var(--accent)' : '2px solid transparent',
                                                transition: 'all 0.2s',
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                    <div style={{ marginLeft: 'auto' }}>
                                        <button onClick={() => copyCode(snippets[activeLang as keyof typeof snippets] || '', 'main')} style={{ background: 'transparent', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer' }}>
                                            {copied === 'main' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <pre style={{ padding: '24px', fontSize: '0.9rem', margin: 0, overflowX: 'auto', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' }}>
                                    <code style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink)', lineHeight: '1.6' }}>
                                        {snippets[activeLang as keyof typeof snippets]}
                                    </code>
                                </pre>
                            </div>
                </div>
                </div>

                <div className="docs-col">
                    <div className="upload-card" style={{ padding: '3rem 2.5rem', margin: 0, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <span style={{ background: 'var(--accent)', color: 'white', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>POST</span>
                                <h2 style={{ fontSize: '2rem', color: 'var(--ink)', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>/api/v1/upload</h2>
                            </div>

                            <p style={{ color: 'var(--ink-dim)', lineHeight: '1.8', marginBottom: '1rem', fontSize: '1.05rem' }}>
                                Upload text, code snippets, or configuration files. The server detects text documents using their <b>file extensions</b>.
                            </p>
                            
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <AlertCircle color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ margin: 0, color: 'var(--ink-dim)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    <b>CRITICAL:</b> When uploading plain text directly from strings/buffers instead of physical files, you <b>MUST</b> provide a dummy file name ending in <code style={{color: '#ef4444'}}>.txt</code> or similar (e.g. <code style={{color: '#ef4444'}}>snippet.txt</code>) so the API server handles the extension correctly.
                                </p>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: '600' }}>Parameters (multipart/form-data)</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>file</b> <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>REQUIRED</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>The text file buffer. <b>Must end in .txt, .js, .md, etc.</b></div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>customId</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>A custom slug for your URL.</div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>password</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Encrypt the text snippet with a password.</div>
                                    </li>
                                    <li style={{ background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                        <b style={{ color: 'var(--ink)', marginRight: '8px' }}>expiration</b> <span style={{ color: 'rgba(26,26,36,0.4)', fontSize: '0.8rem' }}>OPTIONAL</span>
                                        <div style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Valid values: <code>1h</code>, <code>12h</code>, <code>24h</code>, <code>3d</code>, <code>1w</code>, <code>1m</code>, <code>never</code>.</div>
                                    </li>
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <div style={{ borderBottom: '1px solid var(--glass-border)', padding: '12px 20px', display: 'flex', gap: '1.5rem', overflowX: 'auto', alignItems: 'center' }}>
                                    {(['bash', 'python', 'javascript'] as Language[]).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveLang(lang)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: activeLang === lang ? 'var(--accent)' : 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                padding: '8px 0',
                                                borderBottom: activeLang === lang ? '2px solid var(--accent)' : '2px solid transparent',
                                                transition: 'all 0.2s',
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                    <div style={{ marginLeft: 'auto' }}>
                                        <button onClick={() => copyCode(textSnippets[activeLang as keyof typeof textSnippets] || '', 'main')} style={{ background: 'transparent', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer' }}>
                                            {copied === 'main' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <pre style={{ padding: '24px', fontSize: '0.9rem', margin: 0, overflowX: 'auto', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' }}>
                                    <code style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink)', lineHeight: '1.6' }}>
                                        {textSnippets[activeLang as keyof typeof textSnippets]}
                                    </code>
                                </pre>
                            </div>
                </div>
                </div>
            </div>
        </main>
    );
}
