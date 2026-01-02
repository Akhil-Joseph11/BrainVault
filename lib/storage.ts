interface DocumentMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  chunkCount: number;
}

const documentStore = new Map<string, DocumentMetadata[]>();

export function getDocuments(userId: string): DocumentMetadata[] {
  return documentStore.get(userId) || [];
}

export function addDocument(document: DocumentMetadata): void {
  const userDocs = documentStore.get(document.userId) || [];
  userDocs.push(document);
  documentStore.set(document.userId, userDocs);
}

export function deleteDocument(userId: string, documentId: string): boolean {
  const userDocs = documentStore.get(userId) || [];
  const filtered = userDocs.filter((doc) => doc.id !== documentId);
  documentStore.set(userId, filtered);
  return filtered.length < userDocs.length;
}

export function getDocument(userId: string, documentId: string): DocumentMetadata | undefined {
  const userDocs = documentStore.get(userId) || [];
  return userDocs.find((doc) => doc.id === documentId);
}

