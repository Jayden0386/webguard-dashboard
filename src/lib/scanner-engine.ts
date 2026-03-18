import { type ScanResult, type ScanLog, type Vulnerability, type Severity } from "./scanner-types";

const SCAN_CHECKS = [
  { message: "Resolving DNS...", delay: 300 },
  { message: "Establishing connection...", delay: 500 },
  { message: "Checking HTTP security headers...", delay: 800 },
  { message: "Analyzing Content-Security-Policy...", delay: 600 },
  { message: "Checking X-Frame-Options...", delay: 400 },
  { message: "Scanning for XSS indicators...", delay: 900 },
  { message: "Testing URL parameters for SQLi patterns...", delay: 700 },
  { message: "Enumerating exposed directories...", delay: 600 },
  { message: "Checking server information disclosure...", delay: 500 },
  { message: "Analyzing SSL/TLS configuration...", delay: 400 },
  { message: "Validating cookie security flags...", delay: 300 },
  { message: "Finalizing scan report...", delay: 400 },
];

const VULNERABILITY_TEMPLATES: Vulnerability[] = [
  {
    id: "hdr-csp",
    title: "Missing Content-Security-Policy Header",
    severity: "high",
    category: "headers",
    description: "The server does not send a Content-Security-Policy header. This makes the application vulnerable to cross-site scripting (XSS) and data injection attacks.",
    evidence: "Response headers:\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  ❌ Content-Security-Policy: (not set)",
    remediation: "Add a Content-Security-Policy header with a strict policy. Start with: Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  },
  {
    id: "hdr-hsts",
    title: "Missing Strict-Transport-Security Header",
    severity: "high",
    category: "headers",
    description: "The server does not enforce HTTPS through the HSTS header. Clients may connect over insecure HTTP, exposing traffic to interception.",
    evidence: "Response headers:\n  ❌ Strict-Transport-Security: (not set)\n  Expected: max-age=31536000; includeSubDomains",
    remediation: "Add the Strict-Transport-Security header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
  },
  {
    id: "hdr-xfo",
    title: "Weak X-Frame-Options Configuration",
    severity: "medium",
    category: "headers",
    description: "X-Frame-Options is not set or is set to ALLOWALL, allowing the page to be embedded in iframes on any domain, enabling clickjacking attacks.",
    evidence: "Response headers:\n  X-Frame-Options: ALLOWALL\n  Expected: DENY or SAMEORIGIN",
    remediation: "Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking."
  },
  {
    id: "xss-reflect",
    title: "Potential Reflected XSS in Query Parameters",
    severity: "critical",
    category: "xss",
    description: "User input from query parameters appears to be reflected in the page response without proper encoding, indicating a potential reflected XSS vulnerability.",
    evidence: "GET /?q=<script>alert(1)</script>\nResponse body contains unescaped: <script>alert(1)</script>",
    remediation: "Implement proper input validation and output encoding. Use context-aware encoding (HTML entity encoding for HTML context, JavaScript encoding for JS context)."
  },
  {
    id: "sqli-param",
    title: "SQL Injection Pattern in URL Parameters",
    severity: "critical",
    category: "sqli",
    description: "URL parameters contain patterns that suggest SQL injection vulnerability. The application may be concatenating user input directly into SQL queries.",
    evidence: "GET /products?id=1' OR '1'='1\nResponse: 200 OK (expected: 400/403)\nResponse time anomaly: 2.3s vs baseline 0.1s",
    remediation: "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings. Implement input validation with allowlists."
  },
  {
    id: "dir-exposed",
    title: "Exposed .git Directory",
    severity: "high",
    category: "directories",
    description: "The .git directory is publicly accessible, potentially exposing source code, commit history, and sensitive configuration files.",
    evidence: "GET /.git/config → 200 OK\nContent: [core]\\n  repositoryformatversion = 0\\n  bare = false",
    remediation: "Block access to .git directories in your web server configuration. For Nginx: location ~ /\\.git { deny all; }"
  },
  {
    id: "disc-server",
    title: "Server Version Disclosure",
    severity: "low",
    category: "disclosure",
    description: "The server reveals its software version in response headers. Attackers can use this information to target known vulnerabilities.",
    evidence: "Response headers:\n  Server: Apache/2.4.41 (Ubuntu)\n  X-Powered-By: PHP/7.4.3",
    remediation: "Configure the web server to suppress version information. For Apache: ServerTokens Prod. Remove X-Powered-By header."
  },
  {
    id: "hdr-permissions",
    title: "Missing Permissions-Policy Header",
    severity: "medium",
    category: "headers",
    description: "The Permissions-Policy header is not set, allowing the page to use sensitive browser features like camera, microphone, and geolocation without restriction.",
    evidence: "Response headers:\n  ❌ Permissions-Policy: (not set)",
    remediation: "Add a Permissions-Policy header restricting unnecessary features: Permissions-Policy: camera=(), microphone=(), geolocation=()"
  },
  {
    id: "cookie-flags",
    title: "Insecure Cookie Configuration",
    severity: "medium",
    category: "headers",
    description: "Session cookies are missing the Secure and/or HttpOnly flags, potentially exposing them to theft via XSS or man-in-the-middle attacks.",
    evidence: "Set-Cookie: session=abc123; Path=/\n  ❌ Missing: Secure flag\n  ❌ Missing: HttpOnly flag\n  ❌ Missing: SameSite attribute",
    remediation: "Set cookies with Secure, HttpOnly, and SameSite=Strict flags: Set-Cookie: session=abc123; Path=/; Secure; HttpOnly; SameSite=Strict"
  },
];

function pickRandomVulnerabilities(): Vulnerability[] {
  const count = 4 + Math.floor(Math.random() * 4); // 4-7
  const shuffled = [...VULNERABILITY_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
  onProgress: (pct: number) => void
): Promise<ScanResult> {
  const startTime = Date.now();

  onLog({ message: `Initiating scan for ${url}`, timestamp: Date.now(), type: "info" });

  for (let i = 0; i < SCAN_CHECKS.length; i++) {
    const check = SCAN_CHECKS[i];
    await new Promise((r) => setTimeout(r, check.delay));
    onLog({ message: check.message, timestamp: Date.now(), type: "check" });
    onProgress(((i + 1) / SCAN_CHECKS.length) * 100);

    // Randomly add "found" logs
    if (i > 2 && Math.random() > 0.6) {
      await new Promise((r) => setTimeout(r, 200));
      onLog({ message: `⚠ Issue detected during ${check.message.toLowerCase()}`, timestamp: Date.now(), type: "found" });
    }
  }

  const vulns = pickRandomVulnerabilities();
  const score = calculateScore(vulns);
  const totalChecks = 12;
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
