const fs = require('fs');
const transcriptPath = 'C:/Users/PC/.gemini/antigravity/brain/4bc671fc-abe2-40e2-bccd-1f124f8a2f79/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
let count = 0;
for (let line of lines) {
  if (line.includes('EnquiryProfilePage.jsx') && line.includes('TOOL_RESPONSE') && line.includes('Total Lines:')) {
    const obj = JSON.parse(line);
    const output = obj.content || obj.tool_responses[0]?.response?.output;
    fs.writeFileSync(`enquiry_version_${count}.jsx`, output);
    count++;
  }
}
console.log(`Saved ${count} versions.`);
