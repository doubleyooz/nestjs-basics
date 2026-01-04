import { AbstractDocument } from 'src/database/abstract.repository';

export interface User extends AbstractDocument {
  // Required fields
  email: string;
  username: string;
  password: string;
}
