import re

with open('src/app/docs/page.tsx', 'r') as f:
    code = f.read()

# Extract everything before return (
header_match = re.search(r"(.*?)return\s*\(", code, re.DOTALL)
header = header_match.group(1)

# Remove unused states (activeSection, isMobileMenuOpen)
header = re.sub(r"const\s+\[activeSection.*?\n", "", header)
header = re.sub(r"const\s+\[isMobileMenuOpen.*?\n", "", header)

# Remove SidebarItem component definition
header = re.sub(r"const\s+SidebarItem.*?return\s*\(.*?\);\n\s*};\n", "", header, flags=re.DOTALL)


# Extract the three sections
getting_started_match = re.search(r"\{activeSection === 'getting-started' && \(\s*<motion\.section[^>]*>(.*?)</motion\.section>\s*\)\}", code, re.DOTALL)
upload_match = re.search(r"\{activeSection === 'upload' && \(\s*<motion\.section[^>]*>(.*?)</motion\.section>\s*\)\}", code, re.DOTALL)
upload_text_match = re.search(r"\{activeSection === 'upload-text' && \(\s*<motion\.section[^>]*>(.*?)</motion\.section>\s*\)\}", code, re.DOTALL)

getting_started_content = getting_started_match.group(1).strip()
upload_content = upload_match.group(1).strip()
upload_text_content = upload_text_match.group(1).strip()

new_return = f"""
    return (
        <main style={{{{
            minHeight: '100vh',
            padding: '5rem 2rem 4rem',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}}}>
            <header style={{{{ marginBottom: '3.5rem' }}}}>
                <Link href="/" style={{{{ color: 'var(--ink-dim)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontWeight: '500' }}}}>
                    <ArrowLeft size={{16}} /> Back to Home
                </Link>
                <h1 style={{{{ fontSize: '3rem', fontWeight: '800', color: 'var(--ink)', marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}}}>
                    API Documentation
                </h1>
                <p style={{{{ color: 'var(--ink-dim)', fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.6, maxWidth: '700px' }}}}>
                    The complete reference for integrating Telegraph into your applications. Fast, scalable, and decentralized.
                </p>
            </header>

            <div style={{{{ display: 'flex', flexDirection: 'column', gap: '2rem' }}}}>
                <div className="upload-card" style={{{{ padding: '3rem 2.5rem', margin: 0 }}}}>
                    {getting_started_content}
                </div>

                <div className="upload-card" style={{{{ padding: '3rem 2.5rem', margin: 0 }}}}>
                    {upload_content}
                </div>

                <div className="upload-card" style={{{{ padding: '3rem 2.5rem', margin: 0 }}}}>
                    {upload_text_content}
                </div>
            </div>
        </main>
    );
}}
"""

with open('src/app/docs/page.tsx', 'w') as f:
    f.write(header + new_return)

