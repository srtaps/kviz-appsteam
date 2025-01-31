import * as fs from 'node:fs';
import * as path from 'node:path';
import { minify } from 'terser';

const files = ['index', 'leaderboard', 'quizLogic', 'settings'];

async function minifyFiles() {
    for (const file of files) {
        const fileName = path.join(path.resolve(process.cwd()), 'public', 'js', `${file}.js`);
    
        try {
            const fileContent = fs.readFileSync(fileName, 'utf8');
    
            const minifiedResult = await minify(fileContent, {
                compress: {
                  drop_console: true,  // Remove all console.* calls (optional)
                },
                mangle: {
                },
            });

            if (minifiedResult.error) {
                console.error('Error minifying the file content:', minifiedResult.error);
            } else {
                const noInnerHtmlSpace = minifiedResult.code.replace(/\\n\s*/g, '');
                const minifiedFile = path.join(path.resolve(process.cwd()), 'dist', 'js', `${file}.js`);
                fs.writeFileSync(minifiedFile, noInnerHtmlSpace);
                console.log(`Successfully minified ${file}.js`);
            }
        } catch (err) {
            console.error('Error reading the file:', err);
        }
    }
}

minifyFiles();