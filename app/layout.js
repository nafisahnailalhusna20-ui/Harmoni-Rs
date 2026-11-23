import "./globals.css";

export const metadata = {
  title: "HARMONI | Hospital Information System",
  description: "Hospital Information System HARMONI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}