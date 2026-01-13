import { FieldValue } from 'firebase-admin/firestore';

export abstract class AbstractDocument {
  id?: string;
  createdAt?: FieldValue | Date;
  updatedAt?: FieldValue | Date;
}

export type DocumentKeys = keyof AbstractDocument;
