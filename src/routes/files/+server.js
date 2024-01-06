import { Database } from '$lib/database';
import { json } from '@sveltejs/kit';
import { DB_PATH } from '$lib/configs';


export async function GET() {
    const dbInstance = new Database(DB_PATH);
    const jobs = await dbInstance.getAllJobs();
    return json({ message: 'Success getting all jobs', data: jobs});
};