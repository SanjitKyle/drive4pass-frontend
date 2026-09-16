const fs = require('fs');
const transcriptPath = 'C:/Users/PC/.gemini/antigravity/brain/4bc671fc-abe2-40e2-bccd-1f124f8a2f79/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
let calls = [];
for (let line of lines) {
  if (line.includes('EnquiryProfilePage.jsx') && line.includes('"type":"PLANNER_RESPONSE"')) {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let tc of obj.tool_calls) {
        if (JSON.stringify(tc.args).includes('EnquiryProfilePage.jsx')) {
          calls.push({step: obj.step_index, tc: tc});
        }
      }
    }
  }
}
fs.writeFileSync('tool_calls_on_enquiry.json', JSON.stringify(calls, null, 2));
