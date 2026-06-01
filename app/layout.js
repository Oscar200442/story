import './globals.css';

export const metadata = {
  title: 'AI Storyweaver',
  description: 'Interaktiv AI historiefortælling',
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body className="bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}
