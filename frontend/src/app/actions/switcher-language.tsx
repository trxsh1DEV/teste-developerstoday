'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div>
      <button onClick={() => switchLanguage('en')}>EN</button>
      <br />
      <button onClick={() => switchLanguage('pt')}>PT</button>
    </div>
  );
}
