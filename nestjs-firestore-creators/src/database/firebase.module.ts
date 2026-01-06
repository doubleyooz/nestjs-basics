import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';
import { Firestore } from 'firebase-admin/firestore';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_FIRESTORE',
      useFactory: (): Firestore => {
        if (firebaseAdmin.apps.length === 0) {
          const firebaseKeyFilepath = './service_account.json';
          const firebaseServiceAccount = JSON.parse(
            fs.readFileSync(firebaseKeyFilepath, 'utf8').toString(),
          );

          firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(
              firebaseServiceAccount as firebaseAdmin.ServiceAccount,
            ),
          });
        }
        return firebaseAdmin.firestore();
      },
    },
  ],
  exports: ['FIREBASE_FIRESTORE'],
})
export class FirebaseModule {}
