//https://blog.cloudflare.com/api-at-the-edge-workers-and-firestore/

import * as jose from 'jose';
import type { Geopoint, FirestoreObject } from './utils/jsonToFirestore';
import { firestoreToJson } from './utils/jsonToFirestore';
import { jsonToFirestore } from './utils/jsonToFirestore';
import { getContext } from './context.server';

export type GCPClientCreds = {
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
};

export class FirestoreClient {
  private config: GCPClientCreds;
  private url: string;

  private jwt?: string;
  private jwtExpiresAt: number = 0;

  constructor(config: GCPClientCreds, url: string) {
    this.config = config;
    this.url = url;
  }

  async authHeaders() {
    if (!this.jwt || this.jwtExpiresAt < Date.now() / 1000) {
      [this.jwt, this.jwtExpiresAt] = await generateJWT(this.config);
    }

    return { Authorization: `Bearer ${this.jwt}` };
  }

  async getDocument(collection: string, documentId: string) {
    const headers = await this.authHeaders();
    const resp = await fetch(`${this.url}/${collection}/${documentId}`, {
      headers,
    });

    const data = (await resp.json()) as any;
    if (data.error) {
      throw new Error(data.error.message);
    }

    data.fields = firestoreToJson(data.fields);
    return data;
  }

  async addDocument(
    collection: string,
    doc: FirestoreObject,
    documentId?: string
  ) {
    const headers = await this.authHeaders();

    const resp = await fetch(
      `${this.url}/${collection}${
        documentId ? `?documentId=${encodeURIComponent(documentId)}` : ''
      }`,
      {
        headers,
        method: 'POST',
        body: JSON.stringify({
          fields: jsonToFirestore(doc),
        }),
      }
    );

    const data = (await resp.json()) as any;
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.name.split('/').pop() as string;
  }
}

export async function generateJWT(config: GCPClientCreds) {
  const alg = 'RS256';
  const privateKey = await jose.importPKCS8(
    config.privateKey.replace(/\\n/g, '\n'),
    alg
  );

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg, kid: config.privateKeyId, typ: 'JWT' })
    .setIssuer(config.clientEmail)
    .setSubject(config.clientEmail)
    .setAudience('https://firestore.googleapis.com/')
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(privateKey);

  return [jwt, expiresAt] as const;
}

let client: FirestoreClient;
export function getFirestore() {
  if (!client) {
    const context = getContext();
    const config: GCPClientCreds = {
      projectId: context.PROJECT_ID as string,
      privateKeyId: context.PRIVATE_KEY_ID as string,
      privateKey: context.PRIVATE_KEY as string,
      clientEmail: context.CLIENT_EMAIL as string,
    };
    const url = `https://firestore.googleapis.com/v1beta1/projects/${config.projectId}/databases/(default)/documents`;
    client = new FirestoreClient(config, url);
  }
  return client;
}

export async function addRoute(
  userId: string,
  displayName: string,
  start: Geopoint | string,
  destination: Geopoint | string,
  waypoints?: Geopoint | string
) {
  return await getFirestore().addDocument(
    'routes',
    waypoints
      ? {
          userId,
          displayName,
          start,
          waypoints,
          destination,
          timestamp: new Date(),
        }
      : {
          userId,
          displayName,
          start,
          destination,
          timestamp: new Date(),
        }
  );
}
