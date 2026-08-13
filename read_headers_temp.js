const xlsx = require('xlsx');

try {
    const workbook = xlsx.readFile('fulldata/MasterData.xlsx');
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const headers = [];
        const range = xlsx.utils.decode_range(sheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = xlsx.utils.encode_cell({c:C, r:range.s.r});
            const cell = sheet[address];
            if (cell && cell.v !== undefined) {
                headers.push(cell.v);
            }
        }
        console.log(headers.join(', '));
    });
} catch (e) {
    console.error(e.message);
}
