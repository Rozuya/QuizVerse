const fs = require('fs');
const p = process.argv[2];
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  const n = (l.match(/"/g) || []).length;
  if (n % 2 === 1) console.log((i + 1) + ': ' + l);
});
