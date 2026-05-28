import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'firebase-applet-config.json');

if (!fs.existsSync(filePath)) {
  console.log('firebase-applet-config.json not found. Creating dummy file for successful build...');
  const dummyConfig = {
    projectId: 'dummy-project-id',
    appId: 'dummy-app-id',
    apiKey: 'dummy-api-key',
    authDomain: 'dummy-auth-domain',
    firestoreDatabaseId: 'dummy-db-id',
    storageBucket: 'dummy-storage-bucket',
    messagingSenderId: 'dummy-messaging-sender-id',
    measurementId: ''
  };
  fs.writeFileSync(filePath, JSON.stringify(dummyConfig, null, 2));
} else {
  console.log('firebase-applet-config.json found, continuing...');
}
