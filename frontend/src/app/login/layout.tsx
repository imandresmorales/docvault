import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicia sesión en DocVault para acceder a tu repositorio de documentos seguro.',
  robots: { index: true, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
