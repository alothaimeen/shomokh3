const fs = require('fs');
const path = require('path');

const programs = [
    {
        name: "تصحيح التلاوة",
        description: "برنامج تصحيح التلاوة",
        circles: [
            { name: "تصحيح جزء عمَّ", teacher: { name: "ريدى اليوسف", email: "rida@shamokh.edu" } },
            { name: "تصحيح جزء تبارك", teacher: { name: "رحمة أحمد", email: "rahma@shamokh.edu" } },
            { name: "تصحيح ٥ الأحقاف", teacher: { name: "وردة الراشد", email: "warda@shamokh.edu" } }
        ]
    },
    {
        name: "المراجعة",
        description: "برنامج المراجعة",
        circles: [
            { name: "مراجعة المصحف كامل", teacher: { name: "نجوى الأيوبي", email: "najwa@shamokh.edu" } },
            { name: "مراجعة ٥ من البقرة", teacher: { name: "أسماء حميد", email: "asma@shamokh.edu" } },
            { name: "مراجعة ١٠ من البقرة", teacher: { name: "إحسان ضبيط", email: "ihsan@shamokh.edu" } }
        ]
    },
    {
        name: "المراحل العليا",
        description: "برنامج المراحل العليا",
        circles: [
            { name: "عليا م١", teacher: { name: "ثريا بكر", email: "thuraya@shamokh.edu" } },
            { name: "عليا م٢", teacher: { name: "سمية فتوي", email: "sumaya@shamokh.edu" } },
            { name: "عليا م٣", teacher: { name: "مشاعل رمضان", email: "mashael@shamokh.edu" } }
        ]
    }
];

const firstNames = [
    "سارة", "نورة", "فاطمة", "عائشة", "ريم", "منى", "هند", "أمل", "زينب", "خديجة",
    "مريم", "أسماء", "حصة", "جواهر", "لطيفة", "شيخة", "العنود", "نوال", "هدى", "سعاد",
    "ابتسام", "جميلة", "حنان", "دلال", "رنا", "زهراء", "سلوى", "شروق", "صفية", "طرفة",
    "علياء", "غادة", "فوزية", "كوثر", "ليلى", "مها", "نجلاء", "هياء", "وفاء", "ياسمين",
    "آمنة", "بشرى", "تهاني", "ثريا", "جمانة", "حليمة", "خولة", "دعاء", "رغد", "زينة"
];

const lastNames = [
    "العتيبي", "الشمري", "القحطاني", "الدوسري", "المطيري", "الزهراني", "الغامدي", "العسيري", "الشهري", "الحربي",
    "السبيعي", "المالكي", "العنزي", "الرشيدي", "التميمي", "الخالدي", "السالم", "العمري", "اليامي", "البقمي",
    "الجهني", "السعيد", "المحمد", "الصالح", "العبدالله", "الناصر", "الفهد", "العبدالرحمن", "العبدالعزيز", "الإبراهيم"
];

function generateName(index) {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    return `${first} ${last}`;
}

const profiles = [
    { type: "EXCELLENT", count: 6, label: "ممتازة (95-100%)" },
    { type: "GOOD", count: 15, label: "جيدة (80-94%)" },
    { type: "WEAK", count: 6, label: "ضعيفة (60-79%)" },
    { type: "FAILING", count: 3, label: "متعثرة (<60%)" }
];

function generateEmail(name, number) {
    // Simple transliteration map
    const map = {
        'ا': 'a', 'أ': 'a', 'إ': 'a', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
        'ة': 'a', 'ى': 'a', ' ': '.'
    };

    let englishName = name.split('').map(char => map[char] || char).join('');
    englishName = englishName.replace(/[^a-z.]/g, ''); // Remove non-letter chars
    return `s${number}@shamokh.edu`; // Using student number for unique emails to be safe
}

const DEFAULT_PASSWORD = "password123";

const fullData = programs.map((program, pIndex) => {
    return {
        ...program,
        circles: program.circles.map((circle, cIndex) => {
            // Add password to teacher
            circle.teacher.password = DEFAULT_PASSWORD;

            let studentCounter = 0;
            const students = [];

            profiles.forEach(profile => {
                for (let i = 0; i < profile.count; i++) {
                    const globalIndex = (pIndex * 3 * 30) + (cIndex * 30) + studentCounter;
                    const studentNumber = 1000 + globalIndex;
                    const name = generateName(globalIndex);

                    students.push({
                        name: name,
                        email: generateEmail(name, studentNumber),
                        password: DEFAULT_PASSWORD,
                        profile: profile.type,
                        profileLabel: profile.label,
                        studentNumber: studentNumber
                    });
                    studentCounter++;
                }
            });

            return {
                ...circle,
                students
            };
        })
    };
});

fs.writeFileSync(path.join(__dirname, 'seed_data.json'), JSON.stringify(fullData, null, 2));
console.log("Generated seed_data.json");
