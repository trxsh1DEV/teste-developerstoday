import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <main className="container mx-auto mt-8 p-4">
        <h1 className="text-2xl font-bold mb-4">
          Bem-vindo, {session?.user?.name}
        </h1>
        {/* Adicione o conteúdo do dashboard aqui */}
      </main>
    </div>
  );
}
