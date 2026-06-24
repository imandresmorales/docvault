import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Regístrate en DocVault de forma gratuita y comienza a gestionar tus documentos con inteligencia artificial.',
  robots: { index: true, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
