import './globals.css';

export const metadata = {
  title: 'Rithamio - CBSE Class 10 Maths Practice',
  description: 'Improve your CBSE Class 10 Maths scores with daily practice',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
