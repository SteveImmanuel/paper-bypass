import { dbInstance } from '$lib/database';
import { fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as configs from '$lib/configs' ;
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    const row = await dbInstance.get('SELECT password FROM users WHERE username = ?', [username]);
    if (!row || !bcrypt.compareSync(password, row.password)) {
      return fail(401, { message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, configs.JWT_SECRET, { expiresIn: '3h' });
    cookies.set('token', token, { path: '/', maxAge: 60 * 60 * 3 });
    console.log(token);
    return redirect(302, '/');
  }
};