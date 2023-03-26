import { Link } from '@remix-run/react';
import React from 'react';
import { auth, logout, signInWithGoogle } from '~/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex flex-row justify-between p-5 bg-white shadow-sm">
      <Link className="flex flex-row items-center space-x-2" to="/">
        <span
          className="h-5 w-5 rounded-full 
        bg-[#818CF8]"
        ></span>
        <p className="text-lg font-semibold text-black">RowdyBuddy</p>
      </Link>

      <nav>
        {!user ? (
          <button
            className="rounded-md px-3 p-1 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
            onClick={signInWithGoogle}
          >
            Log In
          </button>
        ) : (
          <div className="flex flex-row space-x-4 items-center">
            <h2 className="text-md font-semibold whitespace-nowrap">
              Hi, {user.displayName}
            </h2>
            <button
              className="rounded-md px-3 p-1 font-semibold hover:bg-indigo-500 bg-indigo-400 text-white w-full"
              onClick={logout}
            >
              Log Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
