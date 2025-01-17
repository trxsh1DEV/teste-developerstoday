'use client';

import Link from 'next/link';

export default function LoginButton({
  contentTitle,
}: {
  contentTitle: string;
}) {
  return (
    <Link
      className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
      href="/auth/signin"
    >
      {contentTitle}
    </Link>
  );
}
