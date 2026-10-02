const fs = require('fs');
const p = process.argv[2];
const src = fs.readFileSync(p, 'utf8');
let depth = 0, inStr = false, line = 1, lineStart = 0;
const stack = [];
for (let i = 0; i < src.length; i++) {
  const c = src[i];
  if (c === '\n') line++;
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') { inStr = true; lineStart = line; continue; }
  if (c === "'") {
    // single-quoted string
    let j = i + 1;
    while (j < src.length && src[j] !== "'") { if (src[j] === '\\') j++; j++; }
    i = j;
    continue;
  }
  if (c === '(' || c === '[' || c === '{') { stack.push([c, line]); }
  if (c === ')' || c === ']' || c === '}') {
    const top = stack.pop();
    if (!top) { console.log('EXTRA CLOSE', c, 'line', line); break; }
    const want = { ')': '(', ']': '[', '}': '{' }[c];
    if (top[0] !== want) { console.log('MISMATCH', c, 'line', line, 'opened', top[0], 'line', top[1]); break; }
  }
}
console.log('unclosed:', JSON.stringify(stack.slice(-6)));
