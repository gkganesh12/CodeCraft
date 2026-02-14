
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ConfigLoader } from '../config/loader';
import { OpenAIAdapter, AIMessage } from '../core/llm/client';
import { FRONTEND_DEV_ROLE, BACKEND_DEV_ROLE } from '../core/prompts/roles';
import ora from 'ora';

export async function codeCommand() {
    const spinner = ora('Initializing Code Generator...').start();

    // 1. Load Config & Plan
    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    const planPath = path.join(process.cwd(), 'plan.md');

    if (!config || !fs.existsSync(planPath)) {
        spinner.fail('Missing config or plan.md');
        return;
    }

    const plan = fs.readFileSync(planPath, 'utf-8');

    // 2. Read Files Context (Only those in the plan)
    // This is the "Scope Guard" in action - we only feed relevant files.
    // Match any backticked content that looks like a file path
    const fileRegex = /`([\w./-]+)`/g;
    const matches = [...plan.matchAll(fileRegex)].map(m => m[1]).filter((f): f is string => !!f);
    const uniqueFiles = [...new Set(matches)];

    let fileContext = '';
    for (const file of uniqueFiles) {
        if (file && fs.existsSync(file)) {
            fileContext += `\n--- ${file} ---\n${fs.readFileSync(file, 'utf-8')}\n`;
        }
    }

    // 3. AI Generation
    const apiKey = process.env.CODECRAFT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        spinner.fail('API Key missing.');
        return;
    }
    const ai = new OpenAIAdapter(apiKey);

    // Determine Role based on file extensions
    const frontendExts = ['.tsx', '.jsx', '.css', '.scss', '.html', '.svg'];
    const backendExts = ['.ts', '.js', '.json', '.prisma', '.sql'];

    let isFrontend = false;
    let isBackend = false;

    for (const file of uniqueFiles) {
        if (frontendExts.some(ext => file.endsWith(ext))) isFrontend = true;
        if (backendExts.some(ext => file.endsWith(ext)) && !file.endsWith('.d.ts')) isBackend = true;
    }

    // Default to Backend if uncertain, or Frontend if only UI
    let selectedRole = BACKEND_DEV_ROLE;
    let roleName = 'Backend Developer';

    if (isFrontend && !isBackend) {
        selectedRole = FRONTEND_DEV_ROLE;
        roleName = 'Frontend Developer';
    } else if (isFrontend && isBackend) {
        // Mixed context - could use a "Full Stack" role, but for now let's stick to the stricter Backend role 
        // which usually handles the API/Data layer integration that is more critical.
        // OR we can concat them? No, that confuses the LLM. 
        // Let's use Backend as the "Lead" who knows APIs.
        selectedRole = BACKEND_DEV_ROLE;
        roleName = 'Full Stack Developer (Backend Lead)';
    }

    console.log(chalk.blue(`🎭 Activating Persona: ${roleName}`));

    const prompt: AIMessage[] = [
        {
            role: 'system',
            content: selectedRole + '\n\nAdditional Instruction: You are executing the plan. Return code blocks as requested.'
        },
        {
            role: 'user',
            content: `PLAN:\n${plan}\n\nEXISTING CODE:\n${fileContext}`
        }
    ];

    spinner.text = 'Writing code...';
    try {
        const response = await ai.complete(prompt);

        // 4. Apply Changes
        // Parse the response "### FILE: ..." syntax
        const fileBlocks = response.split('### FILE: ');
        for (const block of fileBlocks) {
            if (!block.trim()) continue;

            const lines = block.split('\n');
            if (lines.length < 1) continue;
            const filenameLine = lines[0];
            const codeParts = lines.slice(1);

            const filename = filenameLine?.trim();
            if (!filename) continue;

            const code = codeParts.join('\n').replace(/```\w+\n/, '').replace(/```$/, '').trim();

            if (filename && code) {
                fs.outputFileSync(path.join(process.cwd(), filename), code);
                console.log(chalk.green(`\nUpdated ${filename}`));
            }
        }

        spinner.succeed('Code generation complete! 🚀');
        console.log('Run "codecraft verify" to check the results.');

    } catch (err: any) {
        spinner.fail(`Coding Failed: ${err.message}`);
    }
}
