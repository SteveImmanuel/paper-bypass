import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$lib/configs';

export async function handle({ event, resolve }) {
    const { headers } = event.request;
    const cookies = cookie.parse(headers.get('cookie'));
    const token = cookies.token || '';
    let auth = false;

    try {
        jwt.verify(token, JWT_SECRET);
        auth = true;
    } catch (error) {
        if (!event.url.pathname.startsWith('/auth')) {
            return redirect(302, '/auth');
        }
    }
    
    if (auth && event.url.pathname.startsWith('/auth')) {
        return redirect(302, '/');
    }
    return await resolve(event);
}