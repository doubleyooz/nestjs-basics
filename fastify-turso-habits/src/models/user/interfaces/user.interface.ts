import { IDocument } from "../../../database/interfaces/document.interface.js";

export interface IUser extends IDocument {
  email: string;
  password: string;
  name: string;
  tokenVersion: number;
}
