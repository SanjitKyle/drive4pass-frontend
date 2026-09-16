const fs = require('fs');
const lines = fs.readFileSync('src/pages/EnquiryProfilePage.jsx', 'utf-8').split('\n');
let code = [];
let started = false;
for (let line of lines) {
  if (line.match(/^\d+:\simport React/)) {
    started = true;
  }
  if (started) {
    if (line.match(/^The above content/)) break;
    // Remove the line number prefix like "1: "
    const match = line.match(/^\d+:\s(.*)/);
    if (match) {
      code.push(match[1]);
    } else if (line.match(/^\d+:$/)) {
      code.push('');
    }
  }
}
fs.writeFileSync('src/pages/EnquiryProfilePage.jsx', code.join('\n'));
