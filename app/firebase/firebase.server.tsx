//https://blog.cloudflare.com/api-at-the-edge-workers-and-firestore/
import { FirebaseAuth, FirebaseConfig } from './firebase-auth';
import type { GCPClientCreds } from './firebase-firestore';
import { FirestoreClient } from './firebase-firestore';
import type { Geopoint } from './jsonToFirestore';
import { getContext } from '~/context.server';

let firebaseAuth: FirebaseAuth;
export function getAuth() {
  if (!firebaseAuth) {
    const context = getContext() as any;
    console.log(context);
    const config: FirebaseConfig = {
      apiKey: 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U',
      projectId: context.PROJECT_ID as string,
      privateKey: context.PRIVATE_KEY as string,
      clientEmail: context.CLIENT_EMAIL as string,
      cache: context.FIREBASE,
    };

    firebaseAuth = new FirebaseAuth(config);
  }

  return firebaseAuth;
}

let firestoreClient: FirestoreClient;
export function getFirestore() {
  if (!firestoreClient) {
    const context = getContext();
    console.log(context);
    const config: GCPClientCreds = {
      projectId: context.PROJECT_ID as string,
      privateKeyId: context.PRIVATE_KEY_ID as string,
      privateKey: context.PRIVATE_KEY as string,
      clientEmail: context.CLIENT_EMAIL as string,
    };
    const url = `https://firestore.googleapis.com/v1beta1/projects/${config.projectId}/databases/(default)/documents`;
    firestoreClient = new FirestoreClient(config, url);
  }
  return firestoreClient;
}

export async function addRoute(
  userId: string,
  displayName: string,
  origin: Geopoint,
  originName: string,
  destination: Geopoint,
  destinationName: string
) {
  const user = await getFirestore().runQuery({
    structuredQuery: {
      from: [
        {
          collectionId: 'users',
        },
      ],
      where: {
        fieldFilter: {
          field: {
            fieldPath: 'uid',
          },
          op: 'EQUAL',
          value: {
            stringValue: userId,
          },
        },
      },
    },
  });

  return await getFirestore().addDocument('routes', {
    userId,
    displayName,
    origin,
    originName,
    destination,
    destinationName,
    timestamp: new Date(),
    userPhoto: user[0]!.data!.photoURL,
  });
}
