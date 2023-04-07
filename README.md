# WalkWithMe

WalkWithMe is a tool allowing users to request a buddy to walk them to their destination for use by students or other members of the community

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/zackumar/WalkWithMe.git
cd WalkWithMe
npm install
```

## Configuring

A few things are needed before you configure WalkWithMe:

- Firebase project

  - Add a Web App
  - Add Firestore to the project
  - Add Firebase Authentication
    - Under `Sign-in methods`, add a Google Provider

- Go to [https://console.google.com](https://console.google.com) and add Google Maps to the Firebase project
  ([https://developers.google.com/maps/documentation/javascript/cloud-setup](https://developers.google.com/maps/documentation/javascript/cloud-setup))

You must configure your Firebase and Google Cloud keys in `app/config.ts`.

After creating a Firebase Project, create a web app and update these keys with your web app's Firebase configuration:

```typescript
import { getContext } from './context.server';

export const API_KEY = 'YOUR_FIREBASE_API_KEY';

export const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: 'your_project.firebaseapp.com',
  projectId: 'your_project',
  storageBucket: 'your_project.appspot.com',
  messagingSenderId: 'your_messaging_id',
  appId: 'your_app_id',
  measurementId: 'your_measurement_id',
};
```

You will need a Firebase service account to run serverside Firebase. In the Firebase console, open Settings > Service Accounts. Click Generate New Private Key, then confirm by clicking Generate Key.

Securely store the JSON file containing the key.

We pulled the necessary values from the JSON file to easily add them to the project. You can either add them directly into your config file, or in a `.dev.vars` with matching names.

```typescript
export const getServerConfig = () => {
  const context = getContext() as any;
  const config = {
    apiKey: API_KEY,
    projectId: context.PROJECT_ID as string ?? 'your_project',
    privateKeyId: context.PRIVATE_KEY_ID as string ?? 'private_key_id',
    privateKey: context.PRIVATE_KEY as string ?? 'private_key',
    clientEmail: context.CLIENT_EMAIL as string 'client_email',
    cache: context.FIREBASE //Cloudflare KV namespace,
  };

  return config;
};
```

## Development

You will be utilizing Wrangler for local development to emulate the Cloudflare runtime. This is already wired up in your package.json as the `dev` script:

```sh
# start the remix dev server and wrangler
npm run dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

## Deployment

Cloudflare Pages are currently only deployable through their Git provider integrations.

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages) and after verifying your email address with Cloudflare, go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything).

Configure the "Build command" should be set to `npm run build`, and the "Build output directory" should be set to `public`.
