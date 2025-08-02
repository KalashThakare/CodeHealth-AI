"use client"
import React from 'react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import "@/app/globals.css"
import { Toggle } from '@/components/ui/themeToggle';

gsap.registerPlugin(useGSAP);

export default function Home() {

  const container = useRef<HTMLDivElement>(null);
  const circle = useRef<HTMLDivElement>(null); 

  useGSAP(
    () => {
      gsap.to(".box", { rotation: "+=360", duration: 3 });
      gsap.to(circle.current, { rotation: "-=360", duration: 3 });
    },
    { scope: container }
  );

  

  return (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div ref={container} className="flex items-center justify-center gap-8 p-8 bg-secondary rounded-lg shadow-lg">
      <div className="font-sans box w-24 h-24 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-blue-300 shadow-md">
        Hi
      </div>
      <div
        className="circle w-24 h-24 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-green-500 to-green-300 shadow-md"
        ref={circle}
      >
      Let's
      </div>
    </div>
    <div className="box w-24 h-24 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-blue-300 shadow-md mt-8">
      Begin
    </div>

    <button className='btn w-40 mt-4' onClick={() => {window.location.href = "http://localhost:3000/login"}}>
      Log In
    </button>
    <button className='btn w-40 mt-4' onClick={() => {window.location.href = "http://localhost:3000/signup"}}>
      Sign Up
    </button>
  </div>
);
}
