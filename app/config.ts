import type { AppLoadContext } from '@remix-run/cloudflare';

export const API_KEY = 'AIzaSyA_ee-H2hLyeiL2TZiFnrAIbGtUqv_1u7U'; // Your API Key

export const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: 'rowdybuddy.firebaseapp.com', // Your Auth Domain
  projectId: 'rowdybuddy', // Your Project ID
  storageBucket: 'rowdybuddy.appspot.com', // Your Storage Bucket
  messagingSenderId: '3773405946', // Your Messaging Sender ID
  appId: '1:3773405946:web:9ea86ff9a57a1af3b7c743', // Your App ID
  measurementId: 'G-T085NK33L2', // Your Measurement ID
};

export const getServerConfig = (context: AppLoadContext) => {
  //Cloudflare Workers uses context rather than process.env like node
  const config = {
    apiKey: API_KEY,
    projectId: context.PROJECT_ID as string, // Your Project ID
    privateKeyId: context.PRIVATE_KEY_ID as string, // Your Private Key ID
    privateKey: context.PRIVATE_KEY as string, // Your Private Key
    clientEmail: context.CLIENT_EMAIL as string, // Your Client Email
    cache: context.FIREBASE as KVNamespace, // Cloudflare KV Namespace
  };

  return config;
};
