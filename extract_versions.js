const fs = require('fs');
const transcriptPath = 'C:/Users/PC/.gemini/antigravity/brain/4bc671fc-abe2-40e2-bccd-1f124f8a2f79/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
let count = 0;
for (let line of lines) {
  if (line.includes('EnquiryProfilePage.jsx') && line.includes('TOOL_RESPONSE') && line.includes('Total Lines')) {
    try {
      const obj = JSON.parse(line);
      let output = null;
      if (obj.content) output = obj.content;
      else if (obj.tool_responses && obj.tool_responses[0] && obj.tool_responses[0].response) output = obj.tool_responses[0].response.output;
      
      if (output) {
        fs.writeFileSync(`version_${count}.txt`, output);
        count++;
      }
    } catch(e) {}
  }
}
console.log('Saved ' + count + ' versions');
