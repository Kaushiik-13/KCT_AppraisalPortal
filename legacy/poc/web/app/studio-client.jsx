'use client';

import dynamic from 'next/dynamic';

const FrameworkStudio=dynamic(()=>import('../src/main.jsx'),{
 ssr:false,
 loading:()=> <main className="app-loading" aria-live="polite">Loading Framework Studio…</main>,
});

export default function StudioClient(){
 return <FrameworkStudio/>;
}
