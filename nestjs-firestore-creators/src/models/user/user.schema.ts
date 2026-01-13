import { AbstractDocument, DocumentKeys } from 'src/database/abstract.document';

export interface User extends AbstractDocument {
  email: string;
  password: string;
  id: string;
  tokenVersion: number;
}

export type UserKeys = keyof User;
