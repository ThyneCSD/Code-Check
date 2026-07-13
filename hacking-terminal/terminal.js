/* =====================================================
   HACKSIM — Terminal Engine + Lessons + Hack Challenge
   ===================================================== */
'use strict';

// ─── State ─────────────────────────────────────────────
const state = {
  currentLesson: 0,
  unlockedLesson: 0,
  completedLessons: new Set(),
  history: [],
  historyIdx: -1,
  isRoot: false,           // Gained root during hack challenge
  hackPhase: 0,            // 0‑based phase of the hack challenge
  typing: false,
};

// ─── Intel panel data (revealed as player progresses) ──
const intelData = [
  { key: 'TARGET HOST', val: '10.13.37.42',   revealed: false },
  { key: 'HOSTNAME',    val: 'corp-srv-01',   revealed: false },
  { key: 'OPEN PORTS',  val: '22, 80, 3306',  revealed: false },
  { key: 'OS',          val: 'Ubuntu 20.04',  revealed: false },
  { key: 'SSH USER',    val: 'admin',          revealed: false },
  { key: 'DB NAME',     val: 'corporate_db',  revealed: false },
  { key: 'FLAG',        val: 'FLAG{y0u_g0t_1n}', revealed: false },
];

// ─── Lesson definitions ────────────────────────────────
const lessons = [
  {
    title: 'LESSON 0 — INTRO TO HACKING',
    unlock_msg: 'Welcome to HackSim. Type "start" to begin your first lesson.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║   INTRO TO ETHICAL HACKING           ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info',  text: 'Hacking is the art of finding and exploiting weaknesses in' },
      { type: 'info',  text: 'computer systems — but doing so LEGALLY and ETHICALLY.' },
      { type: 'blank' },
      { type: 'cyan',  text: '  ▸ Black Hat   — malicious hackers (illegal)' },
      { type: 'warn',  text: '  ▸ Grey Hat    — ambiguous, sometimes unauthorized' },
      { type: 'success',text:'  ▸ White Hat   — ethical hackers, hired to defend systems' },
      { type: 'blank' },
      { type: 'info',  text: 'Ethical hackers (Penetration Testers) follow a structured' },
      { type: 'info',  text: 'process called the Penetration Testing Methodology:' },
      { type: 'blank' },
      { type: 'purple', text: '  1. Reconnaissance   — gather information about the target' },
      { type: 'purple', text: '  2. Scanning          — discover open ports & services' },
      { type: 'purple', text: '  3. Exploitation      — find and use vulnerabilities' },
      { type: 'purple', text: '  4. Post-Exploitation — what can we do with access?' },
      { type: 'purple', text: '  5. Reporting         — document and disclose findings' },
      { type: 'blank' },
      { type: 'success', text: '⚠  Everything in HackSim is SIMULATED. No real systems are' },
      { type: 'success', text: '   harmed. Only use these skills on systems you own or have' },
      { type: 'success', text: '   explicit written permission to test. 🛡' },
      { type: 'blank' },
      { type: 'dim',   text: '─────────────────────────────────────────' },
      { type: 'warn',  text: 'TASK: Type "next" to unlock the next lesson.' },
    ],
    commands: {
      'next': () => completeLesson(0),
    },
    hint: 'Type "start" to see the lesson, then "next" to continue.',
  },
  {
    title: 'LESSON 1 — NETWORK RECONNAISSANCE',
    unlock_msg: 'Lesson 1 unlocked: Network Recon. Type "start" to begin.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║   NETWORK RECONNAISSANCE             ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info',  text: 'Reconnaissance = Information Gathering.' },
      { type: 'info',  text: 'Before attacking, a hacker maps the target landscape.' },
      { type: 'blank' },
      { type: 'cyan',  text: '  PASSIVE RECON  (without touching the target)' },
      { type: 'mid',   text: '  ▸ WHOIS lookup — who owns the domain?' },
      { type: 'mid',   text: '  ▸ DNS records   — subdomains, mail servers' },
      { type: 'mid',   text: '  ▸ Shodan        — "Google for internet-connected devices"' },
      { type: 'mid',   text: '  ▸ LinkedIn/OSINT — find employees, tech stack' },
      { type: 'blank' },
      { type: 'cyan',  text: '  ACTIVE RECON   (interacting with the target)' },
      { type: 'mid',   text: '  ▸ ping         — is the host alive?' },
      { type: 'mid',   text: '  ▸ traceroute   — network path to target' },
      { type: 'mid',   text: '  ▸ nmap          — network scanner (next lesson)' },
      { type: 'blank' },
      { type: 'warn',  text: 'TASK: Run "ping 10.13.37.42" to check if our target is up.' },
    ],
    commands: {
      'ping 10.13.37.42': async () => {
        await typeLines([
          { type: 'dim',  text: 'PING 10.13.37.42 (10.13.37.42) 56(84) bytes of data.' },
          { type: 'mid',  text: '64 bytes from 10.13.37.42: icmp_seq=1 ttl=64 time=0.421 ms' },
          { type: 'mid',  text: '64 bytes from 10.13.37.42: icmp_seq=2 ttl=64 time=0.388 ms' },
          { type: 'mid',  text: '64 bytes from 10.13.37.42: icmp_seq=3 ttl=64 time=0.402 ms' },
          { type: 'blank' },
          { type: 'success', text: '--- 10.13.37.42 ping statistics ---' },
          { type: 'success', text: '3 packets transmitted, 3 received, 0% packet loss' },
          { type: 'blank' },
          { type: 'success', text: '✔ Target is ONLINE. Proceeding...' },
        ]);
        revealIntel(0); // reveal target host
        revealIntel(1); // reveal hostname
        setTimeout(() => completeLesson(1), 800);
      },
    },
    hint: 'Type "ping 10.13.37.42" to ping the target server.',
  },
  {
    title: 'LESSON 2 — PORT SCANNING',
    unlock_msg: 'Lesson 2 unlocked: Port Scanning. Type "start" to begin.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║   PORT SCANNING WITH NMAP            ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info', text: 'Every service on a server listens on a PORT (0–65535).' },
      { type: 'info', text: 'Scanning tells us what "doors" are open.' },
      { type: 'blank' },
      { type: 'cyan', text: '  Common ports you will see:' },
      { type: 'mid',  text: '  Port  22  — SSH  (remote shell login)' },
      { type: 'mid',  text: '  Port  80  — HTTP (web server)' },
      { type: 'mid',  text: '  Port 443  — HTTPS (encrypted web)' },
      { type: 'mid',  text: '  Port 3306 — MySQL database' },
      { type: 'mid',  text: '  Port 21   — FTP  (file transfer)' },
      { type: 'blank' },
      { type: 'cyan', text: '  NMAP flags cheat sheet:' },
      { type: 'mid',  text: '  -sV   detect service versions' },
      { type: 'mid',  text: '  -O    detect operating system' },
      { type: 'mid',  text: '  -p-   scan ALL 65535 ports' },
      { type: 'mid',  text: '  -A    aggressive (OS + version + scripts)' },
      { type: 'blank' },
      { type: 'warn', text: 'TASK: Run "nmap -sV 10.13.37.42" to scan the target.' },
    ],
    commands: {
      'nmap -sv 10.13.37.42': async () => {
        await typeLines([
          { type: 'dim',    text: 'Starting Nmap 7.94 ( https://nmap.org )' },
          { type: 'dim',    text: 'Nmap scan report for corp-srv-01 (10.13.37.42)' },
          { type: 'dim',    text: 'Host is up (0.00042s latency).' },
          { type: 'blank' },
          { type: 'cyan',   text: 'PORT     STATE  SERVICE  VERSION' },
          { type: 'success',text: '22/tcp   open   ssh      OpenSSH 8.2p1 Ubuntu' },
          { type: 'success',text: '80/tcp   open   http     Apache httpd 2.4.41' },
          { type: 'success',text: '3306/tcp open   mysql    MySQL 8.0.29' },
          { type: 'blank' },
          { type: 'dim',    text: 'OS: Linux (Ubuntu 20.04)' },
          { type: 'dim',    text: 'Nmap done: 1 IP address (1 host up)' },
        ]);
        revealIntel(2); // open ports
        revealIntel(3); // OS
        setTimeout(() => completeLesson(2), 800);
      },
    },
    hint: 'Type "nmap -sV 10.13.37.42" (flags are case-insensitive here).',
  },
  {
    title: 'LESSON 3 — BRUTE FORCE BASICS',
    unlock_msg: 'Lesson 3 unlocked: Brute Force Basics. Type "start" to begin.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║   BRUTE FORCE ATTACKS                ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info',  text: 'A Brute Force attack tries many passwords until one works.' },
      { type: 'blank' },
      { type: 'cyan',  text: '  Types of password attacks:' },
      { type: 'mid',   text: '  ▸ Dictionary Attack  — list of common passwords' },
      { type: 'mid',   text: '  ▸ Brute Force        — try every combination (slow)' },
      { type: 'mid',   text: '  ▸ Credential Stuffing— use leaked login lists' },
      { type: 'mid',   text: '  ▸ Phishing           — trick the user into telling you' },
      { type: 'blank' },
      { type: 'cyan',  text: '  Common tools:' },
      { type: 'mid',   text: '  ▸ Hydra  — fast network brute-forcer' },
      { type: 'mid',   text: '  ▸ John the Ripper — offline password cracker' },
      { type: 'mid',   text: '  ▸ Hashcat — GPU-accelerated cracking' },
      { type: 'blank' },
      { type: 'orange',text: '  Why brute force often FAILS:' },
      { type: 'mid',   text: '  ✗ Account lockouts after N attempts' },
      { type: 'mid',   text: '  ✗ CAPTCHAs on login forms' },
      { type: 'mid',   text: '  ✗ Rate limiting / fail2ban' },
      { type: 'mid',   text: '  ✓ Weak/common passwords can still be cracked fast!' },
      { type: 'blank' },
      { type: 'warn',  text: 'TASK: Run "hydra ssh://10.13.37.42 -l admin -P rockyou.txt"' },
    ],
    commands: {
      'hydra ssh://10.13.37.42 -l admin -p rockyou.txt': async () => {
        await typeLines([
          { type: 'dim',    text: 'Hydra v9.4 starting...' },
          { type: 'dim',    text: '[DATA] max 16 tasks per 1 server' },
          { type: 'dim',    text: '[DATA] attacking ssh://10.13.37.42:22/' },
          { type: 'mid',    text: '[ATTEMPT] admin:123456 ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:password ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:letmein ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:qwerty ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:s3cur3p@ss ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:corp2024! ... failed' },
          { type: 'mid',    text: '[ATTEMPT] admin:admin123 ... ' },
          { type: 'success',text: '★  [22][ssh] host: 10.13.37.42   login: admin   password: admin123' },
          { type: 'blank' },
          { type: 'success',text: '1 valid password found! Credentials saved.' },
        ]);
        revealIntel(4); // SSH user
        setTimeout(() => completeLesson(3), 800);
      },
    },
    hint: 'Type "hydra ssh://10.13.37.42 -l admin -P rockyou.txt" to brute-force SSH.',
  },
  {
    title: 'LESSON 4 — PRIVILEGE ESCALATION',
    unlock_msg: 'Lesson 4 unlocked: Privilege Escalation. Type "start" to begin.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║   PRIVILEGE ESCALATION               ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info',  text: 'After getting initial access, you often have LIMITED rights.' },
      { type: 'info',  text: 'PrivEsc = escalating to administrator/root access.' },
      { type: 'blank' },
      { type: 'cyan',  text: '  Linux PrivEsc techniques:' },
      { type: 'mid',   text: '  ▸ sudo -l          — can we run anything as root?' },
      { type: 'mid',   text: '  ▸ SUID binaries     — executables that run as owner' },
      { type: 'mid',   text: '  ▸ Writable /etc/passwd — add our own root user' },
      { type: 'mid',   text: '  ▸ Kernel exploits    — CVE vulnerabilities in OS' },
      { type: 'mid',   text: '  ▸ Cron jobs          — scripts running as root' },
      { type: 'blank' },
      { type: 'cyan',  text: '  Key Linux commands:' },
      { type: 'mid',   text: '  whoami    — who am I?' },
      { type: 'mid',   text: '  id        — groups and uid' },
      { type: 'mid',   text: '  sudo -l   — sudo privileges' },
      { type: 'mid',   text: '  find / -perm -4000 2>/dev/null  — find SUID binaries' },
      { type: 'blank' },
      { type: 'warn',  text: 'TASK: Type "next" to unlock the LIVE HACK CHALLENGE.' },
    ],
    commands: {
      'next': () => completeLesson(4),
    },
    hint: 'Read the lesson then type "next" to continue.',
  },
  {
    title: '🔴 LIVE HACK CHALLENGE — CORP-SRV-01',
    unlock_msg: '🔴 LIVE CHALLENGE unlocked! Type "start" to begin the mission.',
    content: [
      { type: 'title', text: '╔══════════════════════════════════════╗' },
      { type: 'title', text: '║  🔴 LIVE HACK CHALLENGE              ║' },
      { type: 'title', text: '╚══════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'orange',text: 'MISSION BRIEFING' },
      { type: 'info',  text: 'Target: corp-srv-01 (10.13.37.42)' },
      { type: 'info',  text: 'Objective: Gain root access and retrieve the flag.' },
      { type: 'blank' },
      { type: 'warn',  text: 'This is a SIMULATED server. Use what you\'ve learned!' },
      { type: 'blank' },
      { type: 'cyan',  text: 'PHASE 1 — Connect via SSH' },
      { type: 'mid',   text: '  Syntax: ssh admin@10.13.37.42' },
      { type: 'blank' },
    ],
    commands: {},
    hint: 'Start with: ssh admin@10.13.37.42',
  },
];

// ─── DOM refs ──────────────────────────────────────────
const output      = document.getElementById('terminal-output');
const input       = document.getElementById('terminal-input');
const promptLabel = document.getElementById('prompt-label');
const badge       = document.getElementById('terminal-badge');
const statusEl    = document.getElementById('status-indicator');
const hintBox     = document.getElementById('hint-box');
const hintText    = document.getElementById('hint-text');
const progressFill= document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const infoContent = document.getElementById('info-content');
const toast       = document.getElementById('toast');

// ─── Hack challenge commands ───────────────────────────
const hackCommands = {
  // Phase 1: SSH
  'ssh admin@10.13.37.42': async () => {
    if (state.hackPhase >= 1) { print('Already connected.', 'warn'); return; }
    await typeLines([
      { type: 'mid',    text: 'ssh: Connecting to admin@10.13.37.42:22 ...' },
      { type: 'mid',    text: 'Warning: Permanently added \'10.13.37.42\' (ECDSA) to known hosts.' },
      { type: 'warn',   text: 'admin@10.13.37.42\'s password: ' },
      { type: 'mid',    text: '                                     [using credential: admin123]' },
    ]);
    await sleep(600);
    await typeLines([
      { type: 'success',text: '★  Access Granted! Welcome to corp-srv-01' },
      { type: 'blank' },
      { type: 'dim',    text: 'Ubuntu 20.04.4 LTS  |  GNU/Linux 5.15.0-78' },
      { type: 'dim',    text: 'Last login: Mon Jul  7 14:22:11 2025' },
      { type: 'blank' },
      { type: 'cyan',   text: 'PHASE 2 — Explore. Try: ls, whoami, sudo -l' },
    ]);
    state.hackPhase = 1;
    promptLabel.textContent = 'admin@corp-srv-01:~$';
    statusEl.textContent = '● CONNECTED';
    statusEl.classList.add('connected');
    revealIntel(4);
    showToast('✔ SSH access gained!');
  },

  // Phase 2 exploration
  'whoami': () => {
    if (state.hackPhase < 1) { print('Not connected to a host. Use ssh first.', 'error'); return; }
    print('admin', 'info');
    if (state.hackPhase === 1) hint2();
  },
  'id': () => {
    if (state.hackPhase < 1) { print('Not connected.', 'error'); return; }
    print('uid=1001(admin) gid=1001(admin) groups=1001(admin)', 'info');
    hint2();
  },
  'ls': () => {
    if (state.hackPhase < 1) { print('Not connected.', 'error'); return; }
    typeLines([
      { type: 'info', text: 'backup.sh   notes.txt   .bash_history' },
    ]);
    hint2();
  },
  'cat notes.txt': () => {
    if (state.hackPhase < 1) { print('Not connected.', 'error'); return; }
    typeLines([
      { type: 'dim',  text: '# Admin notes - DO NOT SHARE' },
      { type: 'info', text: 'Remember to run backup.sh as root via cron.' },
      { type: 'info', text: 'Cron job: * * * * * /home/admin/backup.sh' },
      { type: 'warn', text: '(backup.sh is writable by admin!)' },
    ]);
    hint2();
  },
  'sudo -l': async () => {
    if (state.hackPhase < 1) { print('Not connected.', 'error'); return; }
    await typeLines([
      { type: 'mid',    text: 'Matching Defaults entries for admin on corp-srv-01:' },
      { type: 'mid',    text: '    env_reset, mail_badpass' },
      { type: 'blank' },
      { type: 'success',text: 'User admin may run the following commands:' },
      { type: 'success',text: '  (ALL : ALL) NOPASSWD: /usr/bin/find' },
      { type: 'blank' },
      { type: 'warn',   text: 'Interesting! "find" can be abused to get a root shell.' },
      { type: 'cyan',   text: 'PHASE 3 — Escalate. Try: sudo find . -exec /bin/sh ; -quit' },
    ]);
    state.hackPhase = Math.max(state.hackPhase, 2);
    hint3();
  },

  // Phase 3: PrivEsc via sudo find
  'sudo find . -exec /bin/sh ; -quit': async () => {
    if (state.hackPhase < 2) {
      print('Permission denied.', 'error');
      print('Hint: Try "sudo -l" first to see what you can run.', 'warn');
      return;
    }
    if (state.hackPhase >= 3) { print('Already root.', 'warn'); return; }
    await typeLines([
      { type: 'mid',    text: 'sudo find . -exec /bin/sh \\; -quit' },
      { type: 'blank' },
      { type: 'success',text: '★  Shell spawned with root privileges!' },
    ]);
    await sleep(500);
    state.hackPhase = 3;
    state.isRoot = true;
    promptLabel.textContent = 'root@corp-srv-01:~#';
    promptLabel.classList.add('root-prompt');
    badge.textContent = '🔴 ROOT ACCESS';
    badge.classList.add('live');
    showToast('🔴 ROOT obtained!', 'success');
    await typeLines([
      { type: 'blank' },
      { type: 'title',  text: '★  ROOT SHELL ACHIEVED  ★' },
      { type: 'blank' },
      { type: 'cyan',   text: 'PHASE 4 — Retrieve the flag!' },
      { type: 'mid',    text: 'Try: cat /root/flag.txt' },
    ]);
    hint4();
  },

  // Phase 4: Get the flag
  'cat /root/flag.txt': async () => {
    if (!state.isRoot) {
      print('Permission denied. Are you root?', 'error');
      return;
    }
    await typeLines([
      { type: 'blank' },
      { type: 'title',  text: '╔══════════════════════════════════════════╗' },
      { type: 'title',  text: '║  🏆  MISSION COMPLETE!                   ║' },
      { type: 'title',  text: '╚══════════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'success',text: '  FLAG{y0u_g0t_1n}' },
      { type: 'blank' },
      { type: 'info',   text: '  Congratulations! You successfully:' },
      { type: 'mid',    text: '  ✓ Performed network reconnaissance' },
      { type: 'mid',    text: '  ✓ Scanned open ports with nmap' },
      { type: 'mid',    text: '  ✓ Cracked SSH password with hydra' },
      { type: 'mid',    text: '  ✓ Identified a sudo misconfiguration' },
      { type: 'mid',    text: '  ✓ Escalated to root via SUID abuse' },
      { type: 'mid',    text: '  ✓ Retrieved the root flag' },
      { type: 'blank' },
      { type: 'orange', text: '  This is a real-world attack chain used in CTFs and' },
      { type: 'orange', text: '  penetration tests. Stay ethical — always get permission!' },
      { type: 'blank' },
      { type: 'dim',    text: '  Type "reset" to restart, or "lessons" to review.' },
    ]);
    revealIntel(5);
    revealIntel(6);
    updateProgress(100);
    showToast('🏆 Challenge Complete!', 'success');
    confettiEffect();
  },
};

function hint2() {
  if (state.hackPhase === 1) {
    hintBox.style.display = 'block';
    hintText.textContent = 'Try exploring: whoami, id, ls, cat notes.txt, sudo -l';
  }
}
function hint3() {
  hintBox.style.display = 'block';
  hintText.textContent = 'You can escalate via sudo find! Run: sudo find . -exec /bin/sh ; -quit';
}
function hint4() {
  hintBox.style.display = 'block';
  hintText.textContent = 'You are root! Try: cat /root/flag.txt';
}

// ─── Print helpers ─────────────────────────────────────
function print(text, cls = 'info') {
  const line = document.createElement('span');
  line.className = `output-line ${cls}`;
  line.textContent = text;
  output.appendChild(line);
  scrollBottom();
  return line;
}

function printRaw(html, cls = 'info') {
  const line = document.createElement('span');
  line.className = `output-line ${cls}`;
  line.innerHTML = html;
  output.appendChild(line);
  scrollBottom();
}

function printBlank() {
  const line = document.createElement('span');
  line.className = 'output-line blank';
  line.innerHTML = '&nbsp;';
  output.appendChild(line);
  scrollBottom();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeLines(lines, delay = 35) {
  for (const l of lines) {
    if (l.type === 'blank') { printBlank(); }
    else { print(l.text, l.type); }
    await sleep(delay);
    scrollBottom();
  }
}

function scrollBottom() {
  output.scrollTop = output.scrollHeight;
}

// ─── Show lesson content ───────────────────────────────
async function showLesson(idx) {
  const lesson = lessons[idx];
  printBlank();
  for (const item of lesson.content) {
    if (item.type === 'blank') { printBlank(); }
    else { print(item.text, item.type); }
    await sleep(28);
  }
  // Show hint
  if (lesson.hint) {
    hintBox.style.display = 'block';
    hintText.textContent = lesson.hint;
  }
}

// ─── Complete a lesson ─────────────────────────────────
async function completeLesson(idx) {
  if (state.completedLessons.has(idx)) return;
  state.completedLessons.add(idx);

  const pct = Math.round((state.completedLessons.size / lessons.length) * 100);
  updateProgress(pct);

  // Mark lesson item
  const el = document.getElementById(`lesson-${idx}`);
  if (el) { el.classList.remove('active'); el.classList.add('completed'); el.querySelector('.lesson-icon').textContent = '✓'; }

  // Unlock next
  const next = idx + 1;
  if (next < lessons.length) {
    state.unlockedLesson = next;
    const nextEl = document.getElementById(`lesson-${next}`);
    if (nextEl) {
      nextEl.classList.remove('locked');
      nextEl.classList.add('just-unlocked');
      setTimeout(() => nextEl.classList.remove('just-unlocked'), 600);
      nextEl.querySelector('.lesson-icon').textContent = '▶';
    }
    printBlank();
    print(`✔ Lesson ${idx} complete!`, 'success');
    print(`⟶  "${lessons[next].title}" unlocked! Click it or type "lesson ${next}".`, 'cyan');
    showToast(`Lesson ${next} unlocked!`);
  } else {
    print('✔ All lessons completed!', 'success');
  }
}

// ─── Switch lesson ─────────────────────────────────────
async function switchLesson(idx) {
  if (idx > state.unlockedLesson) {
    print(`🔒 Lesson ${idx} is locked. Complete lesson ${idx - 1} first.`, 'error');
    return;
  }
  state.currentLesson = idx;

  // Update sidebar active
  document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`lesson-${idx}`);
  if (el) el.classList.add('active');

  // Badge
  if (idx === 5) {
    badge.textContent = '🔴 LIVE CHALLENGE';
    badge.classList.add('live');
  } else {
    badge.textContent = 'TUTORIAL MODE';
    badge.classList.remove('live');
  }

  // Hide hint box initially
  hintBox.style.display = 'none';

  printBlank();
  print(`══ Switched to: ${lessons[idx].title} ══`, 'title');
  if (idx < 5 || state.hackPhase === 0) {
    print('Type "start" to display the lesson content.', 'dim');
  }
}

// ─── Update progress ───────────────────────────────────
function updateProgress(pct) {
  progressFill.style.width = `${pct}%`;
  progressPct.textContent = `${pct}%`;
}

// ─── Intel panel ──────────────────────────────────────
function buildIntelPanel() {
  infoContent.innerHTML = '';
  intelData.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.id = `intel-${i}`;
    const keyEl = document.createElement('span');
    keyEl.className = 'intel-key'; keyEl.textContent = item.key;
    const valEl = document.createElement('span');
    valEl.className = `intel-val ${item.revealed ? 'revealed' : 'redacted'}`;
    valEl.textContent = item.revealed ? item.val : '█████████';
    valEl.id = `intel-val-${i}`;
    div.appendChild(keyEl);
    div.appendChild(valEl);
    infoContent.appendChild(div);
  });
}

function revealIntel(idx) {
  intelData[idx].revealed = true;
  const el = document.getElementById(`intel-val-${idx}`);
  if (el) {
    el.textContent = intelData[idx].val;
    el.classList.remove('redacted');
    el.classList.add('revealed');
  }
}

// ─── Toast notification ────────────────────────────────
let toastTimer = null;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ─── Command dispatcher ────────────────────────────────
async function handleCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;

  // Add to history
  state.history.unshift(raw);
  state.historyIdx = -1;

  // Echo the command
  print(`${promptLabel.textContent} ${raw}`, 'cmd');

  // ── Global commands ──────────────────────────────────
  if (cmd === 'help') { showHelp(); return; }
  if (cmd === 'clear') { output.innerHTML = ''; return; }
  if (cmd === 'reset') { location.reload(); return; }
  if (cmd === 'lessons' || cmd === 'ls lessons') { listLessons(); return; }
  if (cmd === 'start') { await showLesson(state.currentLesson); return; }

  // switch lesson
  const lessonMatch = cmd.match(/^lesson\s+(\d)$/);
  if (lessonMatch) { switchLesson(parseInt(lessonMatch[1])); return; }

  // Lesson-specific commands
  const lesson = lessons[state.currentLesson];
  if (lesson.commands[cmd]) {
    await lesson.commands[cmd]();
    return;
  }

  // Hack challenge commands (lesson 5 active)
  if (state.currentLesson === 5 || state.hackPhase > 0) {
    if (hackCommands[cmd]) {
      await hackCommands[cmd]();
      return;
    }
  }

  // Some common "wrong context" messages
  if (cmd.startsWith('nmap') && state.currentLesson !== 2) {
    print('nmap is used in Lesson 2 — Port Scanning. Switch there first!', 'warn');
    return;
  }
  if (cmd.startsWith('hydra') && state.currentLesson !== 3) {
    print('hydra is used in Lesson 3 — Brute Force. Switch there first!', 'warn');
    return;
  }

  // Unknown
  print(`Command not found: ${raw}`, 'error');
  print('Type "help" for available commands.', 'dim');
}

function showHelp() {
  typeLines([
    { type: 'blank' },
    { type: 'title',  text: '── HACKSIM COMMANDS ──' },
    { type: 'blank' },
    { type: 'cyan',   text: '  NAVIGATION' },
    { type: 'mid',    text: '  start          — display current lesson' },
    { type: 'mid',    text: '  lesson <0-5>   — switch to a lesson' },
    { type: 'mid',    text: '  lessons         — list all lessons' },
    { type: 'mid',    text: '  clear           — clear terminal' },
    { type: 'mid',    text: '  reset           — restart HackSim' },
    { type: 'blank' },
    { type: 'cyan',   text: '  LESSON COMMANDS (context-sensitive)' },
    { type: 'mid',    text: '  next                    — (L0, L4) advance lesson' },
    { type: 'mid',    text: '  ping <ip>               — (L1) ping the target' },
    { type: 'mid',    text: '  nmap -sV <ip>           — (L2) port scan' },
    { type: 'mid',    text: '  hydra ssh://<ip> ...    — (L3) brute force' },
    { type: 'blank' },
    { type: 'cyan',   text: '  LIVE CHALLENGE (L5)' },
    { type: 'mid',    text: '  ssh admin@10.13.37.42' },
    { type: 'mid',    text: '  whoami | id | ls | cat notes.txt | sudo -l' },
    { type: 'mid',    text: '  sudo find . -exec /bin/sh ; -quit' },
    { type: 'mid',    text: '  cat /root/flag.txt' },
    { type: 'blank' },
  ]);
}

function listLessons() {
  typeLines([
    { type: 'blank' },
    { type: 'title', text: '── LESSONS ──' },
    ...lessons.map((l, i) => ({
      type: state.completedLessons.has(i) ? 'success' : i <= state.unlockedLesson ? 'cyan' : 'dim',
      text: `  ${i}. ${l.title} ${state.completedLessons.has(i) ? '[✓]' : i <= state.unlockedLesson ? '' : '[LOCKED]'}`,
    })),
    { type: 'blank' },
  ]);
}

// ─── Input event handlers ─────────────────────────────
input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const val = input.value;
    input.value = '';
    await handleCommand(val);
  }
  if (e.key === 'ArrowUp') {
    state.historyIdx = Math.min(state.historyIdx + 1, state.history.length - 1);
    input.value = state.history[state.historyIdx] ?? '';
    e.preventDefault();
  }
  if (e.key === 'ArrowDown') {
    state.historyIdx = Math.max(state.historyIdx - 1, -1);
    input.value = state.historyIdx === -1 ? '' : (state.history[state.historyIdx] ?? '');
    e.preventDefault();
  }
});

// Sidebar lesson clicks
document.querySelectorAll('.lesson-item').forEach(el => {
  el.addEventListener('click', () => {
    const idx = parseInt(el.dataset.lesson);
    if (el.classList.contains('locked')) {
      showToast(`🔒 Lesson ${idx} is locked. Complete previous lessons first.`, 'error');
      return;
    }
    switchLesson(idx);
  });
});

// Focus input on click anywhere on terminal
document.querySelector('.terminal-body').addEventListener('click', () => input.focus());

// ─── Clock ────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clock-display').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// ─── Background matrix rain canvas ───────────────────
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cols, drops;
  const chars = 'ハッキングABCDEF0123456789アイウエオ@#$%![]{}▲▼★';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols  = Math.floor(W / 18);
    drops = Array.from({ length: cols }, () => Math.random() * -H);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(3, 10, 7, 0.055)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '14px Share Tech Mono, monospace';
    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const alpha = Math.random() > 0.92 ? 1 : 0.18;
      ctx.fillStyle = alpha === 1 ? '#00ff8888' : '#00ff2208';
      ctx.fillText(ch, i * 18, y);
      drops[i] += 18;
      if (drops[i] > H && Math.random() > 0.975) drops[i] = 0;
    });
  }
  setInterval(draw, 60);
})();

// ─── Confetti-ish flash ───────────────────────────────
function confettiEffect() {
  const el = document.querySelector('.terminal-wrap');
  el.style.boxShadow = '0 0 60px #00ff8866';
  setTimeout(() => { el.style.boxShadow = ''; }, 2000);
}

// ─── Boot sequence ────────────────────────────────────
async function boot() {
  input.disabled = true;
  await typeLines([
    { type: 'dim',    text: '[ HACKSIM v1.0 — INITIALIZING ]' },
    { type: 'dim',    text: 'Loading kernel modules...' },
    { type: 'dim',    text: 'Establishing VPN tunnel...' },
    { type: 'dim',    text: 'Anonymizing traffic...' },
    { type: 'dim',    text: 'Spoofing MAC address... done' },
    { type: 'dim',    text: 'Checking network interfaces... tun0 OK' },
    { type: 'blank' },
  ], 40);

  // ASCII logo
  const logo = [
    '  ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██╗███╗   ███╗',
    '  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██║████╗ ████║',
    '  ███████║███████║██║     █████╔╝ ███████╗██║██╔████╔██║',
    '  ██╔══██║██╔══██║██║     ██╔═██╗ ╚════██║██║██║╚██╔╝██║',
    '  ██║  ██║██║  ██║╚██████╗██║  ██╗███████║██║██║ ╚═╝ ██║',
    '  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝     ╚═╝',
  ];
  for (const row of logo) {
    print(row, 'ascii-art');
    await sleep(50);
  }

  await typeLines([
    { type: 'blank' },
    { type: 'orange', text: '  Learn ethical hacking through interactive simulations.' },
    { type: 'cyan',   text: '  All attacks are simulated. No real systems are harmed.' },
    { type: 'blank' },
    { type: 'success',text: '  ✔ System ready. Type "help" for commands or "start" to begin.' },
    { type: 'dim',    text: '  ─────────────────────────────────────────────────────────' },
    { type: 'blank' },
  ], 30);

  input.disabled = false;
  input.focus();
}

// ─── Init ─────────────────────────────────────────────
buildIntelPanel();
boot();
