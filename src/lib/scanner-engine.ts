import { type ScanResult, type ScanLog, type Vulnerability, type Severity } from "./scanner-types";

const SURFACE_CHECKS = [
  { message: "Resolving DNS...", delay: 300 },
  { message: "Establishing connection...", delay: 500 },
  { message: "Checking HTTP security headers...", delay: 800 },
  { message: "Analyzing Content-Security-Policy...", delay: 600 },
  { message: "Checking X-Frame-Options...", delay: 400 },
  { message: "Scanning for XSS indicators...", delay: 700 },
  { message: "Testing URL parameters for SQLi patterns...", delay: 600 },
  { message: "Checking server information disclosure...", delay: 500 },
  { message: "Validating cookie security flags...", delay: 400 },
  { message: "Checking HTTP vs HTTPS...", delay: 300 },
  { message: "Detecting open redirect patterns...", delay: 400 },
];

const DEEP_CHECKS = [
  { message: "Probing for exposed sensitive files (.git, .env, backup.zip)...", delay: 800 },
  { message: "Scanning for hidden admin panels (/admin, /wp-admin, /cpanel)...", delay: 700 },
  { message: "Analyzing HTML source for leaked credentials & API keys...", delay: 900 },
  { message: "Deep scanning JavaScript for hardcoded secrets...", delay: 800 },
  { message: "Parsing robots.txt & sitemap for hidden paths...", delay: 500 },
  { message: "Checking for directory listing...", delay: 400 },
  { message: "Detecting verbose error pages & stack traces...", delay: 500 },
  { message: "Enumerating subdomains (admin., api., dev., staging.)...", delay: 1000 },
  { message: "Checking outdated JavaScript libraries...", delay: 600 },
  { message: "Analyzing TLS/SSL configuration...", delay: 700 },
  { message: "Checking GDPR compliance (cookie consent, privacy policy)...", delay: 500 },
  { message: "CMS fingerprinting (WordPress, Joomla, Drupal)...", delay: 600 },
];

const VULNERABILITY_TEMPLATES: Vulnerability[] = [
  // Surface scan vulnerabilities
  {
    id: "hdr-csp",
    title: "Missing Content-Security-Policy Header",
    severity: "high",
    category: "headers",
    description: "The server does not send a Content-Security-Policy header, making the application vulnerable to XSS and data injection attacks.",
    evidence: "Response headers:\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  ❌ Content-Security-Policy: (not set)",
    remediation: "Add a Content-Security-Policy header: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  },
  {
    id: "hdr-hsts",
    title: "Missing Strict-Transport-Security Header",
    severity: "high",
    category: "headers",
    description: "No HSTS header — clients may connect over insecure HTTP, exposing traffic to interception.",
    evidence: "Response headers:\n  ❌ Strict-Transport-Security: (not set)\n  Expected: max-age=31536000; includeSubDomains",
    remediation: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
  },
  {
    id: "hdr-xfo",
    title: "Weak X-Frame-Options Configuration",
    severity: "medium",
    category: "headers",
    description: "X-Frame-Options allows embedding in iframes on any domain, enabling clickjacking.",
    evidence: "X-Frame-Options: ALLOWALL\nExpected: DENY or SAMEORIGIN",
    remediation: "Set X-Frame-Options to DENY or SAMEORIGIN."
  },
  {
    id: "hdr-permissions",
    title: "Missing Permissions-Policy Header",
    severity: "medium",
    category: "headers",
    description: "No Permissions-Policy header — sensitive browser features (camera, mic, geolocation) unrestricted.",
    evidence: "Response headers:\n  ❌ Permissions-Policy: (not set)",
    remediation: "Add: Permissions-Policy: camera=(), microphone=(), geolocation=()"
  },
  {
    id: "hdr-referrer",
    title: "Missing Referrer-Policy Header",
    severity: "low",
    category: "headers",
    description: "No Referrer-Policy set — the browser may leak sensitive URL paths to third-party sites via the Referer header.",
    evidence: "Response headers:\n  ❌ Referrer-Policy: (not set)",
    remediation: "Add: Referrer-Policy: strict-origin-when-cross-origin"
  },
  {
    id: "xss-reflect",
    title: "Potential Reflected XSS in Query Parameters",
    severity: "critical",
    category: "xss",
    description: "User input from query parameters is reflected in the page without proper encoding.",
    evidence: "GET /?q=<script>alert(1)</script>\nResponse body contains unescaped: <script>alert(1)</script>",
    remediation: "Implement input validation and context-aware output encoding."
  },
  {
    id: "sqli-param",
    title: "SQL Injection Pattern in URL Parameters",
    severity: "critical",
    category: "sqli",
    description: "URL parameters suggest SQL injection vulnerability — the app may concatenate user input into SQL queries.",
    evidence: "GET /products?id=1' OR '1'='1\nResponse: 200 OK (expected: 400/403)\nResponse time anomaly: 2.3s vs baseline 0.1s",
    remediation: "Use parameterized queries. Never concatenate user input into SQL strings."
  },
  {
    id: "cookie-flags",
    title: "Insecure Cookie Configuration",
    severity: "medium",
    category: "headers",
    description: "Session cookies missing Secure and/or HttpOnly flags — vulnerable to theft via XSS or MITM.",
    evidence: "Set-Cookie: session=abc123; Path=/\n  ❌ Missing: Secure\n  ❌ Missing: HttpOnly\n  ❌ Missing: SameSite",
    remediation: "Set cookies with: Secure; HttpOnly; SameSite=Strict"
  },
  {
    id: "open-redirect",
    title: "Open Redirect Vulnerability",
    severity: "medium",
    category: "redirect",
    description: "Application redirects users to arbitrary external URLs — exploitable for phishing.",
    evidence: "GET /redirect?url=https://evil.com → 302 Found\nLocation: https://evil.com",
    remediation: "Validate redirect URLs against an allowlist of trusted domains."
  },
  {
    id: "http-only",
    title: "Site Accessible Over HTTP (No HTTPS Redirect)",
    severity: "high",
    category: "transport",
    description: "The site is accessible over unencrypted HTTP without a redirect to HTTPS.",
    evidence: "GET http://target.com → 200 OK\nNo 301/302 redirect to https://",
    remediation: "Configure an automatic HTTP→HTTPS redirect and enable HSTS."
  },
  // Deep scan vulnerabilities
  {
    id: "deep-git",
    title: "Exposed .git Directory",
    severity: "high",
    category: "disclosure",
    description: "The .git directory is publicly accessible, potentially exposing source code, commit history, and credentials.",
    evidence: "GET /.git/config → 200 OK\n[core]\n  repositoryformatversion = 0\n  bare = false",
    remediation: "Block access to .git: location ~ /\\.git { deny all; }"
  },
  {
    id: "deep-env",
    title: "Exposed .env File",
    severity: "critical",
    category: "disclosure",
    description: "The .env file containing sensitive configuration (API keys, database credentials, secrets) is publicly accessible.",
    evidence: "GET /.env → 200 OK\nDB_PASSWORD=s3cr3t_p4ss\nAPI_KEY=sk_live_xxxxx",
    remediation: "Block access to .env files in web server config. Never store .env in the web root."
  },
  {
    id: "deep-admin",
    title: "Hidden Admin Panel Discovered",
    severity: "high",
    category: "directories",
    description: "An admin panel was found at a predictable URL, potentially allowing unauthorized access.",
    evidence: "GET /admin → 200 OK\nLogin form detected at /admin/login\nGET /wp-admin → 302 → /wp-login.php",
    remediation: "Move admin panels to unpredictable URLs, implement IP allowlisting, and add MFA."
  },
  {
    id: "deep-jskeys",
    title: "API Keys Hardcoded in JavaScript",
    severity: "critical",
    category: "disclosure",
    description: "JavaScript source files contain hardcoded API keys, tokens, or internal endpoints.",
    evidence: "main.bundle.js:\n  const API_KEY = 'sk_live_4eC39Hq...';\n  const INTERNAL_API = 'https://internal-api.corp.com/v2'",
    remediation: "Remove all secrets from client-side code. Use environment variables and server-side proxying."
  },
  {
    id: "deep-dirlist",
    title: "Directory Listing Enabled",
    severity: "medium",
    category: "directories",
    description: "Directory listing is enabled, exposing the file structure and potentially sensitive files.",
    evidence: "GET /uploads/ → 200 OK\nIndex of /uploads/\n  backup_2024.sql  14MB\n  config.old       2KB",
    remediation: "Disable directory listing. Apache: Options -Indexes. Nginx: autoindex off;"
  },
  {
    id: "deep-stacktrace",
    title: "Verbose Error Pages with Stack Traces",
    severity: "medium",
    category: "disclosure",
    description: "Error pages reveal stack traces, internal paths, and framework versions.",
    evidence: "GET /nonexistent → 500\nTraceback (most recent call last):\n  File \"/app/routes.py\", line 42\n  Django 4.2.1",
    remediation: "Use custom error pages (DEBUG=False). Never expose stack traces in production."
  },
  {
    id: "deep-subdomain",
    title: "Exposed Development Subdomains",
    severity: "medium",
    category: "disclosure",
    description: "Development/staging subdomains are publicly accessible and may lack production security controls.",
    evidence: "dev.target.com → 200 OK (development environment)\nstaging.target.com → 200 OK (staging environment)\napi.target.com → 200 OK (API endpoint)",
    remediation: "Restrict access to non-production subdomains via IP allowlisting or VPN."
  },
  {
    id: "deep-tls",
    title: "Weak TLS Configuration",
    severity: "high",
    category: "transport",
    description: "The server supports outdated TLS versions or weak cipher suites.",
    evidence: "TLS 1.0: SUPPORTED ❌\nTLS 1.1: SUPPORTED ❌\nTLS 1.2: SUPPORTED ✓\nWeak cipher: TLS_RSA_WITH_RC4_128_SHA",
    remediation: "Disable TLS 1.0/1.1. Only allow TLS 1.2+ with strong cipher suites."
  },
  {
    id: "deep-privacy",
    title: "Missing GDPR/Privacy Compliance Elements",
    severity: "low",
    category: "privacy",
    description: "The site lacks cookie consent banners, privacy policy links, or uses third-party trackers without disclosure.",
    evidence: "❌ No cookie consent banner detected\n❌ No privacy policy link found\n⚠ Google Analytics loaded without consent",
    remediation: "Implement a cookie consent mechanism. Add a privacy policy page. Disclose all third-party trackers."
  },
  {
    id: "deep-cms",
    title: "CMS Fingerprint: WordPress Detected",
    severity: "info",
    category: "disclosure",
    description: "The site is running WordPress. CMS version and plugins may have known vulnerabilities.",
    evidence: "Meta tag: <meta name='generator' content='WordPress 6.4.2' />\n/wp-content/ directory accessible\n/readme.html → WordPress version info",
    remediation: "Keep CMS and plugins updated. Remove version meta tags. Restrict access to /wp-content/."
  },
  {
    id: "disc-server",
    title: "Server Version Disclosure",
    severity: "low",
    category: "disclosure",
    description: "The server reveals its software version — attackers can target known vulnerabilities.",
    evidence: "Server: Apache/2.4.41 (Ubuntu)\nX-Powered-By: PHP/7.4.3",
    remediation: "Suppress version info: ServerTokens Prod. Remove X-Powered-By header."
  },
  {
    id: "deep-robots",
    title: "Sensitive Paths in robots.txt",
    severity: "low",
    category: "disclosure",
    description: "The robots.txt file reveals internal paths that should not be publicly known.",
    evidence: "robots.txt:\n  Disallow: /admin/\n  Disallow: /api/internal/\n  Disallow: /backup/\n  Disallow: /config/",
    remediation: "Don't rely on robots.txt for security. Use proper access controls for sensitive paths."
  },
  {
    id: "deep-outdatedjs",
    title: "Outdated JavaScript Libraries",
    severity: "medium",
    category: "disclosure",
    description: "The page loads outdated JavaScript libraries with known security vulnerabilities.",
    evidence: "jQuery 2.1.4 (latest: 3.7.1) — CVE-2020-11023\nlodash 4.17.15 (latest: 4.17.21) — CVE-2021-23337",
    remediation: "Update all JavaScript libraries to the latest stable versions."
  },
];

function pickRandomVulnerabilities(deepScan: boolean): Vulnerability[] {
  const surfaceVulns = VULNERABILITY_TEMPLATES.filter((v) =>
    !v.id.startsWith("deep-")
  );
  const deepVulns = VULNERABILITY_TEMPLATES.filter((v) =>
    v.id.startsWith("deep-")
  );

  const surfaceCount = 3 + Math.floor(Math.random() * 3); // 3-5
  const shuffledSurface = [...surfaceVulns].sort(() => Math.random() - 0.5);
  const picked = shuffledSurface.slice(0, surfaceCount);

  if (deepScan) {
    const deepCount = 3 + Math.floor(Math.random() * 4); // 3-6
    const shuffledDeep = [...deepVulns].sort(() => Math.random() - 0.5);
    picked.push(...shuffledDeep.slice(0, deepCount));
  }

  return picked;
}

function calculateScore(vulns: Vulnerability[]): number {
  let deductions = 0;
  const weights: Record<Severity, number> = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
  for (const v of vulns) {
    deductions += weights[v.severity];
  }
  return Math.max(0, Math.min(100, 100 - deductions));
}

export async function simulateScan(
  url: string,
  onLog: (log: ScanLog) => void,
  onProgress: (pct: number) => void,
  deepScan: boolean = true
): Promise<ScanResult> {
  const startTime = Date.now();
  const checks = deepScan ? [...SURFACE_CHECKS, ...DEEP_CHECKS] : SURFACE_CHECKS;

  onLog({ message: `Initiating ${deepScan ? "deep" : "surface"} scan for ${url}`, timestamp: Date.now(), type: "info" });

  for (let i = 0; i < checks.length; i++) {
    const check = checks[i];
    await new Promise((r) => setTimeout(r, check.delay));
    onLog({ message: check.message, timestamp: Date.now(), type: "check" });
    onProgress(((i + 1) / checks.length) * 100);

    if (i > 2 && Math.random() > 0.6) {
      await new Promise((r) => setTimeout(r, 200));
      onLog({ message: `⚠ Issue detected during ${check.message.toLowerCase()}`, timestamp: Date.now(), type: "found" });
    }
  }

  const vulns = pickRandomVulnerabilities(deepScan);
  const score = calculateScore(vulns);
  const totalChecks = checks.length;
  const passedChecks = totalChecks - vulns.length;
  const scanTime = (Date.now() - startTime) / 1000;

  onLog({ message: `Scan complete. Found ${vulns.length} vulnerabilities in ${scanTime.toFixed(1)}s`, timestamp: Date.now(), type: "done" });

  return {
    url,
    score,
    totalChecks,
    passedChecks: Math.max(0, passedChecks),
    failedChecks: vulns.length,
    scanTime,
    vulnerabilities: vulns,
  };
}
