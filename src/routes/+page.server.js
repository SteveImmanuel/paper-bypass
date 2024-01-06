import { Database, jobStatus } from '$lib/database';
import { exec } from 'child_process';
import * as configs from '$lib/configs';


export async function load() {
    return { jobStatus }
}

export const actions = {
    default: async ({ request }) => {
        const dbInstance = new Database(configs.DB_PATH);
        const data = await request.formData();
        const link = data.get('link');


        const sshTunnelPort = Math.floor(Math.random() * 3000) + 6000;
        const childProcess = exec(`node bypass.js ${link} ${configs.DOWNLOAD_DIR} ${configs.SSH_USERNAME} ${configs.SSH_IP} ${configs.SSH_KEY_PATH} ${sshTunnelPort} ${configs.TIMEOUT_DURATION}`);
        console.log(`node bypass.js ${link} ${configs.DOWNLOAD_DIR} ${configs.SSH_USERNAME} ${configs.SSH_IP} ${configs.SSH_KEY_PATH} ${sshTunnelPort} ${configs.TIMEOUT_DURATION}`);
        await dbInstance.createJob(childProcess.pid, link);

        let finalLine = null;
        childProcess.stdout.on('data', (data) => {
            const tempLine = data.toString().trim().split('\n').pop();
            if (tempLine.startsWith('FINALOUT')) {
                finalLine = tempLine.substring(9); // Get rid of 'FINALOUT '
            } else {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] Child process ${childProcess.pid}: ${tempLine}`);
            }
        });

        childProcess.on('exit', (code) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Child process ${childProcess.pid} exited with code ${code}`);
            if (code === 0) {
                dbInstance.updateJobStatus(childProcess.pid, jobStatus.SUCCESS, finalLine);
            } else {
                dbInstance.updateJobStatus(childProcess.pid, jobStatus.FAILED);
            }
        });
    }
};