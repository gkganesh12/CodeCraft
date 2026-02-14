
import { glob } from 'glob';


export class ProjectScanner {
    private cwd: string;

    constructor(cwd: string = process.cwd()) {
        this.cwd = cwd;
    }

    async scan(): Promise<string[]> {
        // Scan all files, ignoring node_modules and .git by default
        // In a real implementation, we would also parse .gitignore
        const files = await glob('**/*', {
            cwd: this.cwd,
            ignore: ['node_modules/**', '.git/**', 'dist/**', '.codecraft/**'],
            nodir: true
        });
        return files;
    }
}
