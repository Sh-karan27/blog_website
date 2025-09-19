import "./globals.css";
import Providers from "../components/providers"; // Client wrapper

export const metadata = {
  title: "My App",
  description: "Next.js with Redux Theme",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
