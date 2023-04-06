import type { ActionArgs } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { logout } from '~/session.server';

export async function action({ request }: ActionArgs) {
  return logout(request);
}

export default function Logout() {
  const fetcher = useFetcher();

  const logout = async () => {
    await fetcher.submit({}, { method: 'post' });
  };

  return <button onClick={logout}>Logout</button>;
}
