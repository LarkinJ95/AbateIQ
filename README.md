# AbateIQ - Industrial Hygiene Platform

Welcome to AbateIQ, a modern, AI-powered platform designed for industrial hygienists and environmental consultants. This application is built on a secure, organization-scoped architecture using Next.js for the frontend and Firebase (Firestore, Authentication, Genkit) for the backend. It provides a robust solution for project management, data collection, and AI-powered report generation.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli) for local development and deployment.
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (required for Firestore emulator).

It's recommended to use a node version manager like `nvm`. If you have `nvm` installed, you can run `nvm use` in the project root to switch to the recommended Node.js version specified in `.nvmrc`.

## 1. Local Development Setup

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Running with Firebase Emulators
For a complete local development experience that mirrors the production Firebase environment, use the Firebase Emulators.

1.  **Start the Emulators and Development Server:**
    This single command will start the Firebase emulators (for Auth, Firestore, and Functions) and the Next.js development server.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`, and the Firebase Emulator UI will be at `http://localhost:4000`.

2.  **Seed the Database (Optional but Recommended):**
    To populate the emulated Firestore database with initial test data (an organization, a sample user, projects, etc.), run the seeding script in a separate terminal:
    ```bash
    npm run seed
    ```
    This script creates a test organization, a sample user, and associated project data. It also provides instructions for setting custom claims on the test user.

## 2. Authentication and Authorization

AbateIQ uses Firebase Authentication with a role-based access control (RBAC) system enforced by Firestore Security Rules.

### Role Matrix
| Role      | Permissions                                                                    |
| :-------- | :----------------------------------------------------------------------------- |
| `admin`   | Full read/write/delete access within their organization. Can manage users.     |
| `editor`  | Can create and update records (e.g., projects, samples) but cannot delete them.|
| `viewer`  | Read-only access to all data within their organization.                        |

### Setting Custom Claims
Custom claims (`orgId` and `role`) are essential for the security rules to work. In a production environment, these would be set by a trusted server process after a user signs up or is invited to an organization.

For local development, you can use the Firebase Admin SDK to set claims for a test user. A utility script for this is planned for a future release. In the meantime, you can use a simple Node.js script:

1. Create a `set-claims.js` file (make sure to **not** commit this file):
   ```javascript
   // set-claims.js
   const admin = require('firebase-admin');
   const serviceAccount = require('./path/to/your/service-account-key.json'); // Download from Firebase Console

   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });

   const uid = 'USER_UID_TO_SET_CLAIMS_FOR'; // UID of your test user
   const claims = { orgId: 'bierlein', role: 'admin' };

   admin.auth().setCustomUserClaims(uid, claims)
     .then(() => {
       console.log('Custom claims set successfully!');
       process.exit(0);
     })
     .catch(error => {
       console.error('Error setting custom claims:', error);
       process.exit(1);
     });
   ```
2. Run the script: `node set-claims.js`. The user will need to log out and log back in for the claims to take effect.

## 3. Deployment

This application is configured for deployment to **Firebase App Hosting**.

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```

2.  **Deploy to a Preview Channel (for Pull Requests):**
    This command will build and deploy your application to a temporary, shareable URL.
    ```bash
    firebase apphosting:backends:deploy --project YOUR_FIREBASE_PROJECT_ID
    ```

3.  **Deploy to Production:**
    To deploy to your live site, merge your changes into the `main` branch. A GitHub Action (to be configured) should automatically handle the production deployment. Manual deployment can be done via:
    ```bash
    firebase deploy --only apphosting --project YOUR_FIREBASE_PROJECT_ID
    ```

## 4. Security and Environment Variables

### Environment Variables
- Create a `.env.local` file for local development. You can copy it from `.env.local.example`.
- **NEVER** commit secret keys or sensitive information to Git.
- For production, store secrets using Firebase App Hosting's secret management:
  ```bash
  firebase apphosting:secrets:set SECRET_NAME
  ```
  These secrets will be automatically available as environment variables in your deployed application.

### Key Rotation
If an API key or service account key is compromised:
1.  **Generate a new key:** Go to the relevant service's console (e.g., Google Cloud for a service account, your weather API provider) and generate a new key.
2.  **Update the secret:** Update the secret in Firebase App Hosting with the new key value.
    ```bash
    firebase apphosting:secrets:set SECRET_NAME
    ```
3.  **Redeploy:** A new deployment may be required for the updated secret to take effect.
4.  **Revoke the old key:** Once you have confirmed the new key is working, revoke the compromised key from the provider's console to prevent further unauthorized access.
