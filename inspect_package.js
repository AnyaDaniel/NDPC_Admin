const fs = require('fs');
const data = fs.readFileSync('package.json', 'utf8');
const idx = data.indexOf('"postcss"');
console.log('idx', idx);
console.log(data.slice(idx - 50, idx + 160));
