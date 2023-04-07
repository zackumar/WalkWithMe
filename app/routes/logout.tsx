import type { ActionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { logout } from '~/session.server';

export async function action({ request }: ActionArgs) {
  return logout(request);
}

export async function Loader() {
  return redirect('/');
}
