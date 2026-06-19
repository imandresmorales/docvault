import { fetchApi } from './api';

export interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  tags: string;
  category: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function uploadDocument(
  file: File,
  metadata: { title: string; description: string; category: string; tags: string },
  onProgress?: (progress: number) => void,
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title || file.name);
  formData.append('description', metadata.description);
  formData.append('category', metadata.category);
  formData.append('tags', metadata.tags);

  // Use XMLHttpRequest to support upload progress
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();

    xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/documents/upload`);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.message || 'Error al subir el archivo'));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.send(formData);
  });
}

export async function getDocuments(): Promise<Document[]> {
  return fetchApi('/documents');
}

export async function getDocument(id: string): Promise<Document> {
  return fetchApi(`/documents/${id}`);
}

export async function deleteDocument(id: string): Promise<void> {
  return fetchApi(`/documents/${id}`, { method: 'DELETE' });
}

export function getDownloadUrl(id: string): string {
  const token = localStorage.getItem('token');
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/documents/${id}/download?token=${token}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
  if (mimeType === 'text/plain') return '📄';
  if (mimeType === 'text/markdown') return '📝';
  return '📁';
}

export const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const CATEGORIES = ['Sin categoría', 'Trabajo', 'Personal', 'Finanzas', 'Legal', 'Otro'];

/* ──────────────────────────────────────────── */
/* Search                                       */
/* ──────────────────────────────────────────── */

export interface SearchParams {
  q?: string;
  category?: string;
  type?: 'pdf' | 'image' | 'text' | 'all';
  sortBy?: 'createdAt' | 'title' | 'size';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  total: number;
  limit: number;
  offset: number;
  items: Document[];
}

export async function searchDocuments(params: SearchParams): Promise<SearchResult> {
  const qs = new URLSearchParams();
  if (params.q)        qs.set('q',        params.q);
  if (params.category) qs.set('category', params.category);
  if (params.type)     qs.set('type',     params.type);
  if (params.sortBy)   qs.set('sortBy',   params.sortBy);
  if (params.order)    qs.set('order',    params.order);
  if (params.limit  != null) qs.set('limit',  String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  return fetchApi(`/documents/search?${qs.toString()}`);
}
