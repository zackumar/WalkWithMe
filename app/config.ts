import { getContext } from './context.server';

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

export const getServerConfig = () => {
  //Cloudflare Workers uses context rather than process.env like node
  const context = getContext() as any;
  const config = {
    apiKey: API_KEY,
    projectId: (context.PROJECT_ID as string) ?? 'YOUR_PROJECT_ID',
    privateKeyId: (context.PRIVATE_KEY_ID as string) ?? 'YOUR_PRIVATE_KEY_ID',
    privateKey: (context.PRIVATE_KEY as string) ?? 'YOU_PRIVATE_KEY',
    clientEmail: (context.CLIENT_EMAIL as string) ?? 'YOUR_CLIENT_EMAIL',
    cache: context.FIREBASE,
  };

  return config;
};
