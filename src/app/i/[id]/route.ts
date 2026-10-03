import { NextRequest, NextResponse } from 'next/server';
import { getImage, deleteImage } from '@/lib/db';
import { getTelegramFileUrl } from '@/lib/telegram';

export const runtime = 'nodejs';

function getExpiredPageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegraph | Link Expired</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; background: #ffffff; color: #0f172a; font-family: 'Inter', system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; box-sizing: border-box; }
        body::before {
          content: ''; position: fixed; inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.03) 0%, transparent 50%);
          z-index: -2; pointer-events: none;
        }
        .card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(15, 23, 42, 0.1); padding: 3rem 2.5rem; border-radius: 24px; max-width: 450px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .icon { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 28px; }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #0f172a; letter-spacing: -0.02em; }
        p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
        a { display: inline-block; background: #FF8A65; color: white; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(255, 138, 101, 0.25); transition: all 0.2s; }
        a:hover { background: #e27c59; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255, 138, 101, 0.35); }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">⌛</div>
        <h1>Link Has Expired</h1>
        <p>This shareable link was configured to self-destruct and is no longer available on our servers.</p>
        <a href="/">Upload New File</a>
    </div>
</body>
</html>`;
}

function getPasswordPageHTML(id: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegraph | Protected Link</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; background: #ffffff; color: #0f172a; font-family: 'Inter', system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
        body::before {
          content: ''; position: fixed; inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255, 138, 101, 0.08) 0%, transparent 50%);
          z-index: -2; pointer-events: none;
        }
        .card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(24px); border: 1px solid rgba(15, 23, 42, 0.1); padding: 3rem 2.5rem; border-radius: 24px; max-width: 420px; width: 100%; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.06); text-align: center; box-sizing: border-box; transition: transform 0.3s ease; }
        .icon { width: 64px; height: 64px; background: rgba(255, 138, 101, 0.1); color: #FF8A65; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; letter-spacing: -0.02em; }
        p { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 2rem; }
        .input-group { position: relative; margin-bottom: 1.25rem; text-align: left; }
        label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em; }
        input { width: 100%; background: #f8fafc; border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 12px; padding: 12px 16px; color: #0f172a; font-size: 0.95rem; outline: none; transition: all 0.2s; box-sizing: border-box; }
        input:focus { border-color: #FF8A65; box-shadow: 0 0 0 3px rgba(255, 138, 101, 0.2); background: white; }
        button { width: 100%; background: #FF8A65; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255, 138, 101, 0.25); }
        button:hover { background: #e27c59; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255, 138, 101, 0.35); }
        button:active { transform: translateY(0); }
        .error-msg { color: #ef4444; font-size: 0.85rem; margin-top: 0.75rem; min-height: 20px; display: none; }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
    </style>
</head>
<body>
    <div class="card" id="lock-card">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h1>Protected File</h1>
        <p>This link is encrypted. Please enter the password to view this file.</p>
        <form id="unlock-form">
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter password" required autofocus>
            </div>
            <button type="submit" id="submit-btn">Decrypt File</button>
            <div class="error-msg" id="error-box"></div>
        </form>
    </div>
    <script>
        const form = document.getElementById('unlock-form');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submit-btn');
        const errorBox = document.getElementById('error-box');
        const card = document.getElementById('lock-card');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = passwordInput.value;
            errorBox.style.display = 'none';
            submitBtn.textContent = 'Decrypting...';
            submitBtn.disabled = true;
            try {
                const response = await fetch('/api/i/' + window.location.pathname.split('/').pop() + '/unlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    window.location.reload();
                } else {
                    throw new Error(data.error || 'Decryption failed');
                }
            } catch (err) {
                submitBtn.textContent = 'Decrypt File';
                submitBtn.disabled = false;
                errorBox.textContent = err.message;
                errorBox.style.display = 'block';
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 400);
            }
        });
    </script>
</body>
</html>`;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: rawId } = await params;

    const hasExtension = rawId.includes('.');
    const id = hasExtension ? rawId.split('.')[0] : rawId;

    try {
        // Fetch without incrementing views first
        const record = await getImage(id, false);

        if (!record) {
            return new NextResponse('Image not found', { status: 404 });
        }

        // 1. Expiration check
        // If max_views is configured:
        // - For sub-resource/extension requests, we check record.views > record.max_views
        //   so the resources can load successfully on the final view.
        // - For page hits (no extension), we check record.views >= record.max_views.
        const maxViewsExpired = record.max_views && (
            hasExtension 
                ? record.views > record.max_views
                : record.views >= record.max_views
        );
        const hasExpired = (record.expires_at && Date.now() > record.expires_at) || maxViewsExpired;

        if (hasExpired) {
            await deleteImage(id);
            const accept = req.headers.get('accept') || '';
            if (hasExtension || !accept.includes('text/html')) {
                return new NextResponse('Link has expired', { status: 404 });
            }
            return new NextResponse(getExpiredPageHTML(), { headers: { 'Content-Type': 'text/html' } });
        }

        // 2. Password Check
        const isUnlocked = req.cookies.get(`unlocked_${id}`)?.value === 'true';
        if (record.password && !isUnlocked) {
            const accept = req.headers.get('accept') || '';
            if (hasExtension || !accept.includes('text/html')) {
                return new NextResponse('Unauthorized: Password required', { status: 401 });
            }
            return new NextResponse(getPasswordPageHTML(id), { headers: { 'Content-Type': 'text/html' } });
        }

        // Detect bots/crawlers to serve raw content directly for clean previews (0 text tags)
        const userAgent = req.headers.get('user-agent') || '';
        const isBot = /bot|telegram|whatsapp|facebookexternalhit|twitter|slack|discord|crawler|spider/i.test(userAgent);

        const fileUrl = await getTelegramFileUrl(record.telegram_file_id);

        const proxyImage = async () => {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const headers = new Headers();
            headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
            return new NextResponse(blob, { headers });
        };

        const accept = req.headers.get('accept') || '';
        
        // Determine if text based on MIME type OR file extension (critical for bot uploads)
        const mimeType = (record.metadata?.type || '').toLowerCase();
        const fileExt = record.metadata?.name ? record.metadata.name.split('.').pop()?.toLowerCase() : '';
        const isText = mimeType.startsWith('text/') || 
                       mimeType === 'application/json' ||
                       mimeType === 'application/javascript' ||
                       (record.metadata?.mediaType === 'document' && ['txt', 'json', 'js', 'py', 'md', 'html', 'css', 'ts', 'tsx'].includes(fileExt || ''));

        if (hasExtension || !accept.includes('text/html') || isBot) {
            return proxyImage();
        }

        // Increment the view in the database now, since we are serving the HTML page
        const updatedRecord = await getImage(id, true);
        const views = updatedRecord ? updatedRecord.views : record.views + 1;

        if (isText && !isBot) {
            const response = await fetch(fileUrl);
            const textContent = await response.text();
            
            // Escape HTML to prevent XSS
            const escapeHtml = (unsafe: string) => {
                return unsafe
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
            };
            const safeText = escapeHtml(textContent);
            
            return new NextResponse(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Telegraph | ${record.metadata?.name || id}</title>
                    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                    <link id="prism-theme" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
                    <style>
                        body { margin: 0; background: #fdfdfd; background-image: radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(255, 255, 255, 0.9) 0%, transparent 55%); color: #3A2E2A; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding-top: 80px; padding-bottom: 90px; transition: background 0.3s, color 0.3s; }
                        body::before { content: ''; position: fixed; top: 50%; left: 50%; width: 100vw; height: 100vh; transform: translate(-50%, -50%); background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E"); z-index: -1; pointer-events: none; }
                        
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translate(-50%, 15px); }
                            to { opacity: 1; transform: translate(-50%, 0); }
                        }
                        
                        @keyframes pulseGlow {
                            0% { box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3); }
                            50% { box-shadow: 0 4px 20px rgba(255, 138, 101, 0.5); }
                            100% { box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3); }
                        }
                        .toolbar { 
                            position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                            display: flex; gap: 15px; z-index: 100;
                            animation: fadeIn 0.6s ease-out forwards;
                        }
                        .container { 
                            width: 100%; max-width: 900px; padding: 0 20px; box-sizing: border-box; 
                            animation: fadeInContainer 0.8s ease-out forwards;
                        }
                        @keyframes fadeInContainer {
                            from { opacity: 0; transform: translateY(15px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .code-window {
                            background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
                            border: 1px solid rgba(255, 255, 255, 0.8);
                            border-radius: 20px;
                            overflow: hidden;
                            box-shadow: 0 12px 40px rgba(0,0,0,0.06);
                            transition: transform 0.3s ease, background 0.3s, border-color 0.3s;
                        }
                        .code-window:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,0.08); }
                        .code-header {
                            display: flex; align-items: center; gap: 8px; padding: 12px 20px;
                            background: rgba(255, 138, 101, 0.1); border-bottom: 1px solid rgba(255, 138, 101, 0.15);
                        }
                        .dot { width: 12px; height: 12px; border-radius: 50%; }
                        .dot.red { background: #ff5f56; }
                        .dot.yellow { background: #ffbd2e; }
                        .dot.green { background: #27c93f; }
                        .code-title { margin-left: 8px; font-family: 'Inter', sans-serif; font-size: 13px; color: #7A6A65; font-weight: 500; }
                        
                        .code-controls { margin-left: auto; display: flex; gap: 8px; align-items: center; }
                        .control-select, .control-btn {
                            background: rgba(255, 138, 101, 0.15); border: 1px solid rgba(255, 138, 101, 0.3);
                            border-radius: 8px; color: #D35400; font-size: 12px; font-weight: 600;
                            padding: 6px 12px; outline: none; cursor: pointer; transition: all 0.2s;
                            font-family: inherit; backdrop-filter: blur(8px);
                        }
                        .control-select:hover, .control-btn:hover { background: rgba(255, 138, 101, 0.25); border-color: rgba(255, 138, 101, 0.4); color: #FF8A65; box-shadow: 0 4px 12px rgba(255, 138, 101, 0.08); }
                        
                        pre {
                            margin: 0; padding: 24px; overflow-x: auto;
                            font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.6;
                            color: #0f172a; white-space: pre-wrap; word-wrap: break-word;
                        }
                        .info-bar {
                            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                            background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
                            padding: 12px 24px; border-radius: 100px; display: flex; gap: 20px; font-size: 13px; color: #7A6A65;
                            border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 8px 32px rgba(0,0,0,0.06);
                            animation: fadeInInfo 1s ease-out forwards;
                            white-space: nowrap; max-width: 90vw; overflow-x: auto;
                        }
                        .info-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                        .info-item b { color: #3A2E2A; margin-right: 0; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
                        a { color: #3A2E2A; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 50px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; white-space: nowrap; }
                        a.primary { background: linear-gradient(135deg, #FF8A65, #FFA98F); color: white; box-shadow: 0 4px 12px rgba(255, 138, 101, 0.25); border: none; }
                        a.primary:hover { transform: translateY(-2px) scale(1.02); animation: pulseGlow 2s infinite; box-shadow: 0 6px 16px rgba(255, 138, 101, 0.35); }
                        a.secondary { background: rgba(255, 138, 101, 0.15); color: #D35400; border: 1px solid rgba(255, 138, 101, 0.3); backdrop-filter: blur(12px); }
                        a.secondary:hover { background: rgba(255, 138, 101, 0.25); border-color: rgba(255, 138, 101, 0.4); color: #FF8A65; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 138, 101, 0.08); }
                        
                        @media(max-width: 600px) {
                            .code-header { flex-wrap: wrap; padding: 12px 16px; }
                            .code-controls { width: 100%; margin-left: 0; margin-top: 8px; overflow-x: auto; padding-bottom: 4px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="toolbar">
                        <a href="/" class="secondary">Upload New</a>
                        <a href="/i/${id}.txt" download class="primary">Download Raw</a>
                    </div>
                    <div class="container">
                        <div class="code-window">
                            <div class="code-header">
                                <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                                <div class="code-title">${record.metadata?.name || `${id}.txt`}</div>
                                <div class="code-controls">
                                    <select id="lang-select" class="control-select">
                                        <option value="text">Plain Text</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="typescript">TypeScript</option>
                                        <option value="python">Python</option>
                                        <option value="html">HTML</option>
                                        <option value="css">CSS</option>
                                        <option value="json">JSON</option>
                                        <option value="go">Go</option>
                                        <option value="rust">Rust</option>
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                        <option value="bash">Bash</option>
                                        <option value="markdown">Markdown</option>
                                    </select>
                                    <button id="theme-btn" class="control-btn">
                                        <span id="theme-icon">🌙</span> Theme
                                    </button>
                                    <button id="copy-code-btn" class="control-btn">
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                            <pre><code id="code-block" class="language-text">${safeText}</code></pre>
                        </div>
                    </div>
                    <div class="info-bar">
                        <div class="info-item"><b>Views</b> <span>${views}</span></div>
                        <div class="info-item"><b>Size</b> <span>${record.metadata?.size ? (record.metadata.size / 1024).toFixed(2) + ' KB' : 'Unknown'}</span></div>
                        <div class="info-item"><b>Date</b> <span>${new Date(record.created_at).toLocaleDateString()}</span></div>
                    </div>
                    
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
                    <script>
                        const codeBlock = document.getElementById('code-block');
                        const langSelect = document.getElementById('lang-select');
                        const themeBtn = document.getElementById('theme-btn');
                        const themeIcon = document.getElementById('theme-icon');
                        const copyCodeBtn = document.getElementById('copy-code-btn');
                        const prismTheme = document.getElementById('prism-theme');

                        // Try auto-detecting language from file extension
                        const filename = "${record.metadata?.name || ''}";
                        const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
                        const extMap = {
                            'js': 'javascript', 'ts': 'typescript', 'tsx': 'typescript', 'py': 'python',
                            'html': 'html', 'css': 'css', 'json': 'json', 'go': 'go', 'rs': 'rust',
                            'cpp': 'cpp', 'c': 'c', 'sh': 'bash', 'md': 'markdown'
                        };
                        const defaultLang = extMap[ext] || 'text';
                        langSelect.value = defaultLang;
                        codeBlock.className = 'language-' + defaultLang;

                        langSelect.addEventListener('change', () => {
                            codeBlock.className = 'language-' + langSelect.value;
                            if (window.Prism) {
                                Prism.highlightElement(codeBlock);
                            }
                        });

                        // Theme toggle
                        let isDark = true;
                        themeBtn.addEventListener('click', () => {
                            isDark = !isDark;
                            if (isDark) {
                                prismTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";
                                themeIcon.textContent = "🌙";
                                document.body.style.background = "#fdfdfd";
                                document.body.style.color = "#3A2E2A";
                                document.querySelector('.code-window').style.background = "rgba(255, 255, 255, 0.6)";
                                document.querySelector('.code-window').style.borderColor = "rgba(255, 255, 255, 0.8)";
                                codeBlock.style.color = "#3A2E2A";
                            } else {
                                // Light theme
                                prismTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
                                themeIcon.textContent = "☀️";
                                document.body.style.background = "#fdfdfd";
                                document.body.style.color = "#3A2E2A";
                                document.querySelector('.code-window').style.background = "rgba(255, 255, 255, 0.9)";
                                document.querySelector('.code-window').style.borderColor = "rgba(255, 255, 255, 1)";
                                codeBlock.style.color = "#3A2E2A";
                            }
                        });

                        // Copy code function
                        copyCodeBtn.addEventListener('click', () => {
                            const rawText = codeBlock.textContent;
                            navigator.clipboard.writeText(rawText).then(() => {
                                copyCodeBtn.textContent = 'Copied!';
                                setTimeout(() => copyCodeBtn.textContent = 'Copy Code', 2000);
                            });
                        });
                        
                        // Initial Prism execution
                        setTimeout(() => {
                            if (window.Prism) Prism.highlightElement(codeBlock);
                        }, 100);
                    </script>
                </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        const ext = record.metadata?.type?.startsWith('video/') ? '.mp4' : record.metadata?.type?.startsWith('audio/') ? '.m4a' : record.metadata?.type?.startsWith('text/') ? '.txt' : '.jpg';
        const proxiedImgSrc = `/i/${id}${ext}`;
        const formattedDate = new Date(record.created_at).toLocaleDateString();
        const formattedSize = record.metadata?.size ? (record.metadata.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown';

        return new NextResponse(
                `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Telegraph | ${record.metadata?.name || id}</title>
                ${record.metadata?.type?.startsWith('video/')
                ? `<meta property="og:type" content="video.other">
                   <meta property="og:video" content="${proxiedImgSrc}">
                   <meta property="og:video:type" content="${record.metadata.type}">
                   <meta property="og:video:width" content="1280">
                   <meta property="og:video:height" content="720">`
                : record.metadata?.type?.startsWith('audio/')
                ? `<meta property="og:type" content="music.song">
                   <meta property="og:audio" content="${proxiedImgSrc}">
                   <meta property="og:audio:type" content="${record.metadata.type}">`
                : `<meta property="og:type" content="website">
                   <meta property="og:image" content="${proxiedImgSrc}">`
            }
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    body { margin: 0; background: #fdfdfd; background-image: radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(255, 255, 255, 0.9) 0%, transparent 55%); color: #3A2E2A; font-family: 'Inter', system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
                    body::before { content: ''; position: fixed; top: 50%; left: 50%; width: 100vw; height: 100vh; transform: translate(-50%, -50%); background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E"); z-index: -1; pointer-events: none; }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, 15px); }
                        to { opacity: 1; transform: translate(-50%, 0); }
                    }
                    
                    @keyframes pulseGlow {
                        0% { box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3); }
                        50% { box-shadow: 0 4px 20px rgba(255, 138, 101, 0.5); }
                        100% { box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3); }
                    }

                    .container { 
                        position: relative; max-width: 90vw; max-height: 80vh; display: flex; align-items: center; justify-content: center; 
                        animation: fadeInContainer 0.8s ease-out forwards;
                    }
                    @keyframes fadeInContainer {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    img, video, audio { max-width: 100%; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(15, 23, 42, 0.1); object-fit: contain; transition: transform 0.3s ease; }
                    img:hover, video:hover, audio:hover { transform: scale(1.01); box-shadow: 0 24px 48px rgba(0,0,0,0.12); }
                    .toolbar { 
                        position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                        display: flex; gap: 15px; z-index: 100;
                        animation: fadeIn 0.6s ease-out forwards;
                    }
                    .info-bar {
                        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                        background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
                        padding: 12px 24px; border-radius: 100px; display: flex; gap: 20px; font-size: 13px; color: #7A6A65;
                        border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 8px 32px rgba(0,0,0,0.06);
                        animation: fadeInInfo 1s ease-out forwards;
                        white-space: nowrap; max-width: 90vw; overflow-x: auto;
                    }
                    .info-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                    .info-item b { color: #3A2E2A; margin-right: 0; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
                    a { color: #3A2E2A; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 50px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; white-space: nowrap; }
                    a.primary { background: linear-gradient(135deg, #FF8A65, #FFA98F); color: white; box-shadow: 0 4px 12px rgba(255, 138, 101, 0.25); border: none; }
                    a.primary:hover { transform: translateY(-2px) scale(1.02); animation: pulseGlow 2s infinite; box-shadow: 0 6px 16px rgba(255, 138, 101, 0.35); }
                    a.secondary { background: rgba(255, 138, 101, 0.15); color: #D35400; border: 1px solid rgba(255, 138, 101, 0.3); backdrop-filter: blur(12px); }
                    a.secondary:hover { background: rgba(255, 138, 101, 0.25); border-color: rgba(255, 138, 101, 0.4); color: #FF8A65; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 138, 101, 0.08); }
                </style>
            </head>
            <body>
                <div class="toolbar">
                    <a href="/" class="secondary">Upload New</a>
                    <a href="${proxiedImgSrc}" download class="primary">Download Raw</a>
                </div>
                <div class="container">
                    ${record.metadata?.type?.startsWith('video/')
                ? `<video src="${proxiedImgSrc}" autoplay loop muted playsinline controls></video>`
                : record.metadata?.type?.startsWith('audio/')
                ? `<audio src="${proxiedImgSrc}" controls></audio>`
                : `<img src="${proxiedImgSrc}" alt="Image">`
            }
                </div>
                <div class="info-bar">
                    <div class="info-item"><b>Views</b> <span>${views}</span></div>
                    <div class="info-item"><b>Size</b> <span>${formattedSize}</span></div>
                    <div class="info-item"><b>Date</b> <span>${formattedDate}</span></div>
                </div>
            </body>
            </html>`,
            {
                headers: { 'Content-Type': 'text/html' },
            }
        );
    } catch (error) {
        console.error('Redirection error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
