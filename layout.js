import "./globals.css";

export const metadata = {
  title: "বাংলা ব্যাকরণ বিশ্লেষক",
  description: "HSC বাংলা ব্যাকরণ বিশ্লেষক — NCTB ও বাংলা একাডেমি অনুসারে",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
