//https://blog.cloudflare.com/api-at-the-edge-workers-and-firestore/
import { FirebaseAuth } from './firebase-auth';
import { FirestoreClient } from './firebase-firestore';
import type { Geopoint } from './jsonToFirestore';
import { getServerConfig } from '~/config';
import { getContext } from '~/context.server';

let firebaseAuth: FirebaseAuth;
export function getAuth() {
  if (!firebaseAuth) {
    const context = getContext();
    const config = getServerConfig(context);
    console.log(config);
    firebaseAuth = new FirebaseAuth(config);
  }

  return firebaseAuth;
}

let firestoreClient: FirestoreClient;
export function getFirestore() {
  if (!firestoreClient) {
    const context = getContext();
    const config = getServerConfig(context);
    console.log(config);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${config.projectId}/databases/(default)/documents`;
    firestoreClient = new FirestoreClient(config, url);
  }
  return firestoreClient;
}

export async function hasRoute(userId: string) {
  const routes = await getRouteFromId(userId);
  return routes;
}

export async function getRouteFromId(userId: string) {
  const routes = await getFirestore().runQuery({
    structuredQuery: {
      from: [
        {
          collectionId: 'routes',
        },
      ],
      where: {
        fieldFilter: {
          field: {
            fieldPath: 'userId',
          },
          op: 'EQUAL',
          value: {
            stringValue: userId,
          },
        },
      },
    },
  });

  return routes[0] ?? undefined;
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
