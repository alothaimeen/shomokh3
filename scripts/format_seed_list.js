const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_data.json'), 'utf8'));

let output = "# قائمة الطالبات والدرجات المتوقعة\n\n";
output += "هذا الملف يحتوي على القائمة الكاملة للطالبات (270 طالبة) اللاتي سيتم إضافتهن، مع مستوى أدائهن المتوقع وبيانات الدخول.\n\n";
output += "> **ملاحظة مهمة:** كلمة المرور الموحدة لجميع الحسابات (معلمات وطالبات) هي: `password123`\n\n";

data.forEach(program => {
    output += `## برنامج: ${program.name}\n\n`;
    program.circles.forEach(circle => {
        output += `### حلقة: ${circle.name}\n`;
        output += `- **المعلمة:** ${circle.teacher.name}\n`;
        output += `- **البريد الإلكتروني:** \`${circle.teacher.email}\`\n`;
        output += `- **كلمة المرور:** \`${circle.teacher.password}\`\n\n`;

        output += `| م | اسم الطالبة | البريد الإلكتروني | كلمة المرور | المستوى | الوصف |\n`;
        output += `|---|-------------|-------------------|-------------|---------|-------|\n`;
        circle.students.forEach((student, index) => {
            let icon = "";
            if (student.profile === "EXCELLENT") icon = "🥇";
            if (student.profile === "GOOD") icon = "🥈";
            if (student.profile === "WEAK") icon = "⚠️";
            if (student.profile === "FAILING") icon = "❌";

            output += `| ${index + 1} | ${student.name} | \`${student.email}\` | \`${student.password}\` | ${icon} ${student.profile} | ${student.profileLabel} |\n`;
        });
        output += `\n---\n\n`;
    });
});

fs.writeFileSync(path.join(__dirname, '../docs/seed_students_list.md'), output);
console.log("Generated docs/seed_students_list.md");
