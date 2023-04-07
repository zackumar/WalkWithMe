import { getContext } from './context.server';
import { AppLoadContext } from '@remix-run/cloudflare';

export const API_KEY = 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U';

export const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: 'rowdybuddy.firebaseapp.com',
  projectId: 'rowdybuddy',
  storageBucket: 'rowdybuddy.appspot.com',
  messagingSenderId: '3773405946',
  appId: '1:3773405946:web:9ea86ff9a57a1af3b7c743',
  measurementId: 'G-T085NK33L2',
};

export const getServerConfig = (context: AppLoadContext) => {
  //Cloudflare Workers uses context rather than process.env like node
  const config = {
    apiKey: API_KEY,
    projectId: context.PROJECT_ID as string,
    privateKeyId: context.PRIVATE_KEY_ID as string,
    privateKey: context.PRIVATE_KEY as string,
    clientEmail: context.CLIENT_EMAIL as string,
    cache: context.FIREBASE as KVNamespace,
  };

  return config;
};
