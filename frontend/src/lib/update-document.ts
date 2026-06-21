import { fetchApi } from './api';

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  category?: string | null;
  tags?: string;
}

export async function updateDocument(
  id: string,
  payload: UpdateDocumentPayload,
): Promise<void> {
  await fetchApi(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
