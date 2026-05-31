import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'

import { assertFirebaseConfig, firebaseConfig } from '@/config/env'

/**
 * Firebase init for the web. Unlike the RN app, the browser SDK persists the
 * session automatically (`browserLocalPersistence`, the default) — no
 * AsyncStorage / getReactNativePersistence plumbing. We set it explicitly for
 * clarity so a restored session survives reloads.
 */
assertFirebaseConfig()

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)

// Default on web already, set explicitly to document intent (session survives reload).
void setPersistence(auth, browserLocalPersistence)

export { app, auth }
