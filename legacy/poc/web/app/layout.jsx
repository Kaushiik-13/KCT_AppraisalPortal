import './globals.css';

export const metadata={
 title:'AFPI · Framework Studio',
 description:'Build, test, and score configurable KPI verification workflows.',
};

export default function RootLayout({children}){
 return <html lang="en"><body>{children}</body></html>;
}
