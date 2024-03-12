import { promisify } from "util";
import fs from "fs";
import path from "path";
import convert from "heic-convert";

async function convertHEICFilesInFolder(folderPath, outputFolder) {
    const readdir = promisify(fs.readdir);
    const stat = promisify(fs.stat);

    const files = await readdir(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStat = await stat(filePath);
        if (fileStat.isDirectory()) {
            await convertHEICFilesInFolder(filePath, outputFolder); // Рекурсивный вызов для подпапок
        } else if (path.extname(file) === ".HEIC") {
            const inputBuffer = await promisify(fs.readFile)(filePath);
            const outputBuffer = await convert({
                buffer: inputBuffer,
                format: "JPEG",
                quality: 1,
            });
            await promisify(fs.writeFile)(
                path.join(outputFolder, `${path.parse(file).name}.jpg`),
                outputBuffer
            );
        }
    }
}

(async () => {
    const inputFolder = "./DCIM"; // Путь к основной папке с файлами HEIC
    const outputFolder = "./outputFolder"; // Путь к папке, куда будут сохранены сконвертированные файлы
    await convertHEICFilesInFolder(inputFolder, outputFolder);
})();
