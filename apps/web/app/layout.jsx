import './globals.css';

export const metadata = {
  title: 'AFPI',
  description: 'Faculty appraisal and performance intelligence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
