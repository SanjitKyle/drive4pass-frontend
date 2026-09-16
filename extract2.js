const fs = require('fs');
const transcriptPath = 'C:/Users/PC/.gemini/antigravity/brain/4bc671fc-abe2-40e2-bccd-1f124f8a2f79/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
for (let line of lines) {
  if (line.includes('file:///d:/sanjit/drivepasslatestdashboard20june/src/pages/EnquiryProfilePage.jsx') && line.includes('Total Lines:')) {
    const obj = JSON.parse(line);
    const output = obj.content || obj.tool_responses[0]?.response?.output;
    fs.writeFileSync('original_content.txt', output);
    console.log('Saved to original_content.txt');
    break;
  }
}
