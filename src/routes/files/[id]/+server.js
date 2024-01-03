import { Database, jobStatus } from '$lib/database';
import { json, redirect } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import { DB_PATH } from '$lib/configs';
import path from 'path';


export async function GET({ params }) {
    const { id } = params;
    const dbInstance = new Database(DB_PATH);
    const job = await dbInstance.getJobById(id);

    if (!job || job.status !== jobStatus.SUCCESS) {
        return redirect(302, '/');
    }
    const filePath = path.resolve(job.path);
    const file = await fs.readFile(filePath);
    return new Response(file, {
        headers: {
            'Content-Disposition': 'inline',
            'Content-Type': 'application/pdf'
        },
    });
};