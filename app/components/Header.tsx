import { Link } from '@remix-run/react';
import React from 'react'

export function Header(){
  return ( <header className="absolute inset-x-0 top-0 z-10 flex flex-row justify-between p-5 bg-white shadow-sm">
        <Link className="flex flex-row items-center space-x-2" to="/">
          <span
            className="h-5 w-5 rounded-full 
        bg-[#818CF8]"
          ></span>
          <p className="text-lg font-semibold text-black">RowdyBuddy</p>
        </Link>
      </header>)
}
