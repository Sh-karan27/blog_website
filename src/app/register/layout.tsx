// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 dark:bg-dark-bg flex items-center justify-center ">
      {children}
    </div>
  );
}
