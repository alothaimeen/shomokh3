const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const files = [
    "C:\\Users\\memm2\\Documents\\programming\\shomokh3\\ارشيف\\📅 التقويم الفصل الدراسي الأول من عام 1447هـ.docx",
    "C:\\Users\\memm2\\Documents\\programming\\shomokh3\\ارشيف\\📚 البرامج والحلقات الكاملة لمنصة شموخ.docx",
    "C:\\Users\\memm2\\Documents\\programming\\shomokh3\\ارشيف\\تقسيم حلقات شموخ.docx"
];

async function extract() {
    let output = "";
    for (const file of files) {
        try {
            console.log(`Reading ${file}...`);
            const result = await mammoth.extractRawText({ path: file });
            output += `\n\n=== FILE: ${path.basename(file)} ===\n\n`;
            output += result.value;
            if (result.messages.length > 0) {
                console.log("Messages:", result.messages);
            }
        } catch (error) {
            console.error(`Error reading ${file}:`, error);
            output += `\n\n=== ERROR READING ${path.basename(file)} ===\n${error.message}\n`;
        }
    }
    fs.writeFileSync("extracted_data.txt", output);
    console.log("Done. Wrote to extracted_data.txt");
}

extract();
