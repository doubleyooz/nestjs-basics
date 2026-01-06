import { NotFoundException } from '@nestjs/common';
import {
  Firestore,
  CollectionReference,
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  WriteBatch,
  Transaction,
  FieldValue,
} from 'firebase-admin/firestore';
import { PinoLogger } from 'nestjs-pino';

export abstract class AbstractDocument {
  id?: string;
  createdAt?: FieldValue | Date;
  updatedAt?: FieldValue | Date;
}

export type OrderByCondition = {
  field: string;
  direction?: 'asc' | 'desc';
};

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected collection: CollectionReference;

  constructor(
    protected readonly firestore: Firestore,
    private readonly collectionName: string,
    private readonly logger: PinoLogger,
  ) {
    this.collection = this.firestore.collection(collectionName);
    this.logger.setContext(this.constructor.name);
  }

  // Helper to convert Firestore timestamps
  protected convertTimestamps(data: any): any {
    if (!data) return data;

    const result = { ...data };

    // Convert Firestore Timestamp to Date if needed
    if (result.createdAt && typeof result.createdAt.toDate === 'function') {
      result.createdAt = result.createdAt.toDate();
    }
    if (result.updatedAt && typeof result.updatedAt.toDate === 'function') {
      result.updatedAt = result.updatedAt.toDate();
    }

    return result;
  }

  async create(
    document: Omit<TDocument, 'id'>,
    options?: { generateId?: boolean; id?: string },
  ): Promise<TDocument> {
    // Firestore auto-generates IDs when doc() is called without arguments
    const docRef = options?.id
      ? this.collection.doc(options.id)
      : this.collection.doc();

    const docData = {
      ...document,
      id: docRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(docData);

    const snapshot = await docRef.get();
    return this.convertTimestamps({
      id: docRef.id,
      ...snapshot.data(),
    }) as TDocument;
  }

  async findOneById(
    id: string,
    options?: {
      populate?: (doc: TDocument) => Promise<TDocument>;
      transaction?: Transaction;
    },
  ): Promise<TDocument> {
    let docRef: DocumentReference;
    let snapshot: DocumentSnapshot;

    if (options?.transaction) {
      docRef = this.collection.doc(id);
      snapshot = await options.transaction.get(docRef);
    } else {
      docRef = this.collection.doc(id);
      snapshot = await docRef.get();
    }

    if (!snapshot.exists) {
      this.logger.warn('Document not found with id', id);
      throw new NotFoundException('Document not found.');
    }

    let document = this.convertTimestamps({
      id: snapshot.id,
      ...snapshot.data(),
    }) as TDocument;

    // Simple population implementation (you might need to customize this)
    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }

  async findOneByQuery(
    queryBuilder: (collection: CollectionReference) => Query,
    options?: {
      populate?: (doc: TDocument) => Promise<TDocument>;
      transaction?: Transaction;
    },
  ): Promise<TDocument> {
    const query: Query = queryBuilder(this.collection);
    let snapshot: QuerySnapshot;

    if (options?.transaction) {
      snapshot = await options.transaction.get(query);
    } else {
      snapshot = await query.get();
    }

    if (snapshot.empty) {
      this.logger.warn('Document not found with query');
      throw new NotFoundException('Document not found.');
    }

    const doc = snapshot.docs[0];
    let document = this.convertTimestamps({
      id: doc.id,
      ...doc.data(),
    }) as TDocument;

    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }

  async findOneByQueryAndUpdate(
    queryBuilder: (collection: CollectionReference) => Query,
    update: Partial<TDocument>,
    options?: {
      merge?: boolean;
      transaction?: Transaction;
      populate?: (doc: TDocument) => Promise<TDocument>;
    },
  ): Promise<TDocument> {
    const query: Query = queryBuilder(this.collection);
    let snapshot: QuerySnapshot;

    if (options?.transaction) {
      snapshot = await options.transaction.get(query);
    } else {
      snapshot = await query.get();
    }

    if (snapshot.empty) {
      this.logger.warn('Document not found with query');
      throw new NotFoundException('Document not found.');
    }

    // Get the first matching document
    const doc = snapshot.docs[0];
    const docRef = this.collection.doc(doc.id);

    const updateData = {
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Update the document
    if (options?.transaction) {
      options.transaction.update(docRef, updateData);
    } else {
      await docRef.update(updateData);
    }

    // Fetch the updated document
    const updatedSnapshot = options?.transaction
      ? await options.transaction.get(docRef)
      : await docRef.get();

    if (!updatedSnapshot.exists) {
      this.logger.warn('Document disappeared after update');
      throw new NotFoundException('Document not found after update.');
    }

    let document = this.convertTimestamps({
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    }) as TDocument;

    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }

  async findOneByIdAndUpdate(
    id: string,
    update: Partial<TDocument>,
    options?: {
      merge?: boolean;
      transaction?: Transaction;
      populate?: (doc: TDocument) => Promise<TDocument>;
    },
  ): Promise<TDocument> {
    const docRef = this.collection.doc(id);

    const updateData = {
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (options?.transaction) {
      options.transaction.update(docRef, updateData);
    } else {
      await docRef.update(updateData);
    }

    // Fetch the updated document
    const snapshot = options?.transaction
      ? await options.transaction.get(docRef)
      : await docRef.get();

    if (!snapshot.exists) {
      this.logger.warn(`Document not found with id:`, id);
      throw new NotFoundException('Document not found.');
    }

    let document = this.convertTimestamps({
      id: snapshot.id,
      ...snapshot.data(),
    }) as TDocument;

    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }

  async findOneByQueryAndDelete(
    queryBuilder: (collection: CollectionReference) => Query,
    options?: {
      transaction?: Transaction;
      populate?: (doc: TDocument) => Promise<TDocument>;
    },
  ): Promise<TDocument> {
    const query: Query = queryBuilder(this.collection);
    let snapshot: QuerySnapshot;

    if (options?.transaction) {
      snapshot = await options.transaction.get(query);
    } else {
      snapshot = await query.get();
    }

    if (snapshot.empty) {
      this.logger.warn('Document not found with query');
      throw new NotFoundException('Document not found.');
    }

    // Get the first matching document
    const doc = snapshot.docs[0];
    const docRef = this.collection.doc(doc.id);

    // Get the document data before deletion
    let document = this.convertTimestamps({
      id: doc.id,
      ...doc.data(),
    }) as TDocument;

    // Delete the document
    if (options?.transaction) {
      options.transaction.delete(docRef);
    } else {
      await docRef.delete();
    }

    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }
  async findOneByIdAndDelete(
    id: string,
    options?: {
      transaction?: Transaction;
      populate?: (doc: TDocument) => Promise<TDocument>;
    },
  ): Promise<TDocument> {
    const docRef = this.collection.doc(id);

    // Get the document first
    const snapshot = options?.transaction
      ? await options.transaction.get(docRef)
      : await docRef.get();

    if (!snapshot.exists) {
      this.logger.warn(`Document not found with id:`, id);
      throw new NotFoundException('Document not found.');
    }

    let document = this.convertTimestamps({
      id: snapshot.id,
      ...snapshot.data(),
    }) as TDocument;

    // Delete the document
    if (options?.transaction) {
      options.transaction.delete(docRef);
    } else {
      await docRef.delete();
    }

    if (options?.populate) {
      document = await options.populate(document);
    }

    return document;
  }

  async upsert(
    id: string,
    document: Partial<TDocument>,
    options?: {
      transaction?: Transaction;
      merge?: boolean;
    },
  ): Promise<TDocument> {
    const docRef = this.collection.doc(id);

    const docData = {
      ...document,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Check if document exists
    const snapshot = options?.transaction
      ? await options.transaction.get(docRef)
      : await docRef.get();

    const operationData = snapshot.exists
      ? docData
      : {
          ...docData,
          createdAt: FieldValue.serverTimestamp(),
        };

    if (options?.transaction) {
      await options.transaction.set(docRef, operationData, {
        merge: options.merge ?? true,
      });
    } else {
      await docRef.set(operationData, { merge: options?.merge ?? true });
    }

    // Fetch the document
    const updatedSnapshot = options?.transaction
      ? await options.transaction.get(docRef)
      : await docRef.get();

    return this.convertTimestamps({
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    }) as TDocument;
  }

  async find(
    queryBuilder: (collection: CollectionReference) => Query,
    options?: {
      populate?: (doc: TDocument) => Promise<TDocument>;
      transaction?: Transaction;
    },
  ): Promise<TDocument[]> {
    let snapshot: QuerySnapshot;

    const query: Query = queryBuilder(this.collection);

    if (options?.transaction) {
      snapshot = await options.transaction.get(query);
    } else {
      snapshot = await query.get();
    }

    let documents = snapshot.docs.map(
      (doc) =>
        this.convertTimestamps({
          id: doc.id,
          ...doc.data(),
        }) as TDocument,
    );

    // Apply population if provided
    if (options?.populate) {
      documents = await Promise.all(
        documents.map((doc) => options.populate!(doc)),
      );
    }

    return documents;
  }

  async findAll(options?: {
    populate?: (doc: TDocument) => Promise<TDocument>;
    transaction?: Transaction;
  }): Promise<TDocument[]> {
    return this.find((col) => col, options);
  }

  async startTransaction(): Promise<Transaction> {
    return this.firestore.runTransaction(async (transaction) => {
      return transaction;
    });
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    return this.firestore.runTransaction(updateFunction);
  }

  async batch(): Promise<WriteBatch> {
    return this.firestore.batch();
  }

  async deleteMany(
    ids: string[],
    options?: {
      batch?: WriteBatch;
      transaction?: Transaction;
    },
  ): Promise<void> {
    if (options?.batch) {
      ids.forEach((id) => {
        const docRef = this.collection.doc(id);
        options.batch!.delete(docRef);
      });
      return;
    }

    if (options?.transaction) {
      await Promise.all(
        ids.map(async (id) => {
          const docRef = this.collection.doc(id);
          await options.transaction!.delete(docRef);
        }),
      );
      return;
    }

    // Without batch or transaction, delete individually
    await Promise.all(
      ids.map(async (id) => {
        await this.collection.doc(id).delete();
      }),
    );
  }

  async deleteByQuery(
    queryBuilder: (collection: CollectionReference) => Query,
    options?: {
      batch?: WriteBatch;
      transaction?: Transaction;
    },
  ): Promise<string[]> {
    const query = queryBuilder(this.collection);
    const snapshot = await query.get();
    const ids = snapshot.docs.map((doc) => doc.id);

    await this.deleteMany(ids, options);

    return ids;
  }

  async exists(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const snapshot = await docRef.get();
    return snapshot.exists;
  }

  async count(
    queryBuilder?: (collection: CollectionReference) => Query,
  ): Promise<number> {
    const query = queryBuilder
      ? queryBuilder(this.collection)
      : this.collection;

    const snapshot = await query.get();
    return snapshot.size;
  }
  async paginate(
    queryBuilder: (collection: CollectionReference) => Query,
    page: number = 1,
    limit: number = 10,
    options?: {
      transaction?: Transaction;
    },
  ): Promise<{
    data: TDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = queryBuilder(this.collection);
    const offset = (page - 1) * limit;

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated data
    const paginatedQuery = query.limit(limit).offset(offset);
    let snapshot: QuerySnapshot;

    if (options?.transaction) {
      snapshot = await options.transaction.get(paginatedQuery);
    } else {
      snapshot = await paginatedQuery.get();
    }

    const data = snapshot.docs
      .map((doc) => {
        const docData = doc.data();
        return docData
          ? (this.convertTimestamps({
              id: doc.id,
              ...docData,
            }) as TDocument)
          : null;
      })
      .filter((doc): doc is TDocument => doc !== null);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
