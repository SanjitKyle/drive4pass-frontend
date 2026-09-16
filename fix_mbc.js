const fs = require('fs');
const file = 'src/pages/MasterBookingCalender.jsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\}\s*\)\s*\{\s*const finalColor = customColor \|\| '#dc2626'; \/\/ red/;

const replacement = `            }
        }
    };

    /* ================= DISABLE QUICK POPUP ================= */

    const onPopupOpen = (args) => {
        if (args.type === 'QuickInfo') {
            args.cancel = true;
        }
        if (args.type === 'Editor') {
            const status = args.data?.Status || args.data?.EventType;
            if (status === 'leave' || status === 'Day Off') {
                args.cancel = true;
            }
        }
    };

    /* ================= EVENT COLORS ================= */

    const onEventRendered = (args) => {

        const status = args.data?.Status;
        const customColor = args.data?.color;

        // Completed
        if (
            status === 'completed'
        ) {
            const finalColor = customColor || '#16a34a'; // green
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
        }

        // Cancelled
        else if (
            status === 'cancelled'
        ) {
            const finalColor = customColor || '#dc2626'; // red`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(file, code);
    console.log("Fixed with regex!");
} else {
    console.log("Target not found with regex");
}
