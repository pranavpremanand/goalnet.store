// Rejects easy-to-guess passwords without requiring any particular character types.

const COMMON_PASSWORDS = new Set([
  "password", "passw0rd", "passcode", "admin", "administrator", "welcome", "letmein", "login", "master", "secret",
  "iloveyou", "monkey", "dragon", "sunshine", "princess", "superman", "batman", "trustno", "freedom", "whatever",
  "qwerty", "qwertyuiop", "asdfghjkl", "zxcvbnm", "abc", "abcd", "abcdef", "abcdefg", "abcdefgh",
  "football", "soccer", "goalnet", "goal", "jersey", "messi", "ronaldo", "neymar", "barcelona", "realmadrid",
  "liverpool", "argentina", "manchester", "chelsea", "arsenal",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "qazwsxedc"];
const LEET: Record<string, string> = { "@": "a", "4": "a", "0": "o", "1": "i", "!": "i", "3": "e", "$": "s", "5": "s", "7": "t" };
const MIN_RUN = 4;
const MAX_PATTERN_COVERAGE = 0.7;

function stripTrailingNonLetters(value: string) {
  return value.replace(/[^a-z]+$/, "");
}

function decodeLeet(value: string) {
  return value.replace(/[@4013!$57]/g, (char) => LEET[char] ?? char);
}

function isRepeatingUnit(value: string) {
  for (let unit = 1; unit <= 3 && unit * 2 <= value.length; unit++) {
    if (value.slice(0, unit).repeat(Math.ceil(value.length / unit)).slice(0, value.length) === value) return true;
  }
  return false;
}

function charKind(char: string) {
  if (/\d/.test(char)) return "digit";
  return /[a-z]/.test(char) ? "letter" : "other";
}

// Share of characters that sit inside ascending/descending runs (abcd, 4321) or keyboard rows (qwer).
function patternCoverage(value: string) {
  const covered = new Array<boolean>(value.length).fill(false);

  for (let start = 0; start < value.length - 1; ) {
    const step = value.charCodeAt(start + 1) - value.charCodeAt(start);
    const kind = charKind(value[start]);
    let end = start + 1;
    if (Math.abs(step) === 1 && kind !== "other") {
      while (end + 1 < value.length && charKind(value[end + 1]) === kind && value.charCodeAt(end + 1) - value.charCodeAt(end) === step) end++;
    }
    if (end - start + 1 >= MIN_RUN) for (let index = start; index <= end; index++) covered[index] = true;
    start = end > start + 1 ? end : start + 1;
  }

  const rows = [...KEYBOARD_ROWS, ...KEYBOARD_ROWS.map((row) => [...row].reverse().join(""))];
  for (let start = 0; start + MIN_RUN <= value.length; start++) {
    for (let length = Math.min(10, value.length - start); length >= MIN_RUN; length--) {
      if (rows.some((row) => row.includes(value.slice(start, start + length)))) {
        for (let index = start; index < start + length; index++) covered[index] = true;
        break;
      }
    }
  }

  return covered.filter(Boolean).length / value.length;
}

export function isWeakPassword(password: string) {
  const lower = password.toLowerCase();
  const stripped = stripTrailingNonLetters(lower);
  const candidates = [lower, stripped, decodeLeet(stripped), decodeLeet(lower)];

  if (candidates.some((candidate) => COMMON_PASSWORDS.has(candidate))) return true;
  if (isRepeatingUnit(lower)) return true;
  return patternCoverage(lower) >= MAX_PATTERN_COVERAGE;
}
