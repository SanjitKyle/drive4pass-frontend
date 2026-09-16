const fs = require('fs');
const file = 'src/pages/MasterBookingCalender.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
let inLeave = false;
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Leave') && lines[i+1] && lines[i+1].includes('else if')) {
        startIdx = i;
    }
    if (startIdx !== -1 && i > startIdx && lines[i].includes('// Working Shift')) {
        endIdx = i - 1; // line before Working Shift
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `        // Leave
        else if (
            status === 'leave' || status === 'Day Off'
        ) {
            const finalColor = '#e5e7eb';
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
            // Striped background for leaves
            args.element.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)';
        }
`;
    lines.splice(startIdx, endIdx - startIdx, replacement);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Successfully replaced the Leave block!");
} else {
    console.log("Could not find the bounds.", startIdx, endIdx);
}
