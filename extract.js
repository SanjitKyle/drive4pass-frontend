const fs = require('fs');
const lines = fs.readFileSync('C:/Users/PC/.gemini/antigravity/brain/4bc671fc-abe2-40e2-bccd-1f124f8a2f79/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');
for(let l of lines) {
  if (l.includes('TOOL_RESPONSE') && l.includes('EnquiryProfilePage.jsx') && l.includes('Total Lines')) {
    fs.writeFileSync('original_enquiry.json', l);
    console.log('Done');
    break;
  }
}
