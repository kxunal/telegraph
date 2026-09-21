import re

with open('src/app/docs/page.tsx', 'r') as f:
    content = f.read()

# Replace mobile header background
content = content.replace("background: 'var(--bg-primary)',", "background: 'var(--glass)',")
content = content.replace("borderBottom: '1px solid var(--border-primary)',", "borderBottom: '1px solid var(--glass-border)',")
content = content.replace("border: '1px solid var(--border-primary)',", "border: '1px solid var(--glass-border)',")
content = content.replace("background: 'var(--bg-secondary)',", "background: 'rgba(255,255,255,0.6)',")
content = content.replace("color: 'var(--text-primary)'", "color: 'var(--ink)'")
content = content.replace("color: 'var(--text-secondary)'", "color: 'var(--ink-dim)'")
content = content.replace("color: 'var(--text-tertiary)'", "color: 'rgba(26,26,36,0.4)'")

# Fix code blocks
content = content.replace("background: 'var(--bg-secondary)'", "background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)'")

with open('src/app/docs/page.tsx', 'w') as f:
    f.write(content)
