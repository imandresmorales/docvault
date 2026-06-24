import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — enables "Add to Home Screen" and PWA capabilities.
 * Generated at build time as /manifest.webmanifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DocVault — Repositorio de Documentos',
    short_name: 'DocVault',
    description: 'Sistema seguro de gestión documental con IA',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business', 'utilities'],
    lang: 'es',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Subir documento',
        short_name: 'Subir',
        description: 'Sube un nuevo documento a DocVault',
        url: '/dashboard/upload',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Mis documentos',
        short_name: 'Documentos',
        description: 'Accede a tu lista de documentos',
        url: '/dashboard/documents',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
    screenshots: [],
  };
}
