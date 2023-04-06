import { getAuth } from './firebase/firebase.server';
import { createCookie, redirect } from '@remix-run/cloudflare';

export const session = createCookie('session', {
  secrets: ['test'],
  expires: new Date(Date.now() + 60 * 60 * 24 * 14 * 1000),
  path: '/',
});

export async function getUserId(request: Request) {
  const jwt = await session.parse(request.headers.get('Cookie'));
  if (!jwt) return null;
  return await getAuth().verifySessionCookie(jwt);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function logout(request: Request) {
  console.log('logout');
  return redirect('/', {
    headers: {
      'Set-Cookie': await session.serialize('', {
        expires: new Date(0),
      }),
    },
  });
}
