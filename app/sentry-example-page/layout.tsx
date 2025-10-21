import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "sentry-example-page",
  description: "Test Sentry for your Next.js app!",
};

export default function SentryExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}