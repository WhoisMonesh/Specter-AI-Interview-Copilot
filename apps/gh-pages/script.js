/**
 * Specter AI Website JavaScript - Client OS Detection & Simulator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  detectClientOS();
  setupSimulator();
});

// OS Detection
function detectClientOS() {
  const osEl = document.getElementById('detected-os-name');
  if (!osEl) return;

  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('mac')) {
    osEl.textContent = 'macOS (Apple Silicon & Intel)';
  } else if (ua.includes('win')) {
    osEl.textContent = 'Windows 10 & 11';
  } else if (ua.includes('linux')) {
    osEl.textContent = 'Linux (AppImage / DEB)';
  } else {
    osEl.textContent = 'macOS, Windows & Linux';
  }
}

// Interactive Simulator Scenarios
const SCENARIOS = {
  dsa: {
    type: 'Detected: DSA Problem (Two Sum)',
    question: '"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may not use the same element twice."',
    code: `# Key Idea: One-pass hash map storing complement index.
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Time O(N) - Space O(N)`
  },
  behavioral: {
    type: 'Detected: Behavioral / Background Question',
    question: '"Tell me about a challenging technical problem you solved recently and what impact it made."',
    code: `Candidate Spoken Talking Points (STAR Method):
- Situation: In my last role, our payments webhook service began dropping events during sudden flash sales, losing 4% of customer transactions.
- Action: I redesigned the ingestion layer with an asynchronous Redis queue and idempotency keys, adding retry backoff with Dead Letter Queues.
- Result: We achieved 99.99% event delivery reliability and handled 10x traffic spikes with zero dropped transactions.`
  },
  system: {
    type: 'Detected: System Design (URL Shortener)',
    question: '"How would you design a scalable URL shortener like bit.ly handling 100M new URLs per month?"',
    code: `Key Design Components:
1. Assumptions: 100M writes/month (~40 writes/sec), 10:1 read-to-write ratio (~400 reads/sec).
2. Key Generation: Base62 encoding (62^7 = 3.5 Trillion combinations) using distributed Counter / KGS (Key Generation Service).
3. Data Store: NoSQL key-value store (DynamoDB or Cassandra) mapping shortKey -> originalUrl.
4. Caching: Redis cluster for top 20% hot links (80-20 rule).
5. Data Flow: Client -> Cloudflare CDN -> NGINX Load Balancer -> Service Cluster -> Redis Cache -> NoSQL.
6. Trade-offs: Eventual consistency across global replicas prioritizes read latency over immediate sync.`
  },
  debugging: {
    type: 'Detected: Bug / Debugging Task',
    question: '"Our Node.js API process RSS memory keeps steadily increasing over time until it crashes. What is the cause?"',
    code: `Root Cause:
Event listeners or unclosed timers attached inside request handlers without removal, preventing garbage collection.

Fixed Code Snippet:
// Fix: Clean up listener on connection close
req.on('close', () => {
  customEmitter.removeListener('data', onData);
});`
  }
};

function setupSimulator() {
  const buttons = document.querySelectorAll('.btn-sim');
  const typeEl = document.getElementById('sim-detected-type');
  const textEl = document.getElementById('sim-transcript-text');
  const codeEl = document.getElementById('sim-code-target');
  const copyBtn = document.getElementById('sim-copy-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenarioKey = btn.dataset.scenario;
      const data = SCENARIOS[scenarioKey];
      if (data) {
        typeEl.textContent = data.type;
        textEl.textContent = data.question;
        codeEl.textContent = data.code;
      }
    });
  });

  if (copyBtn && codeEl) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeEl.innerText);
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy Code', 2000);
    });
  }
}
