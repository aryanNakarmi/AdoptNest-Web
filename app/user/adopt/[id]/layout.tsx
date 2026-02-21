import { ReactNode } from "react";

interface AdoptDetailLayoutProps {
  children: ReactNode;
}

export default function AdoptDetailLayout({
  children,
}: AdoptDetailLayoutProps) {
  return <>{children}</>;
}