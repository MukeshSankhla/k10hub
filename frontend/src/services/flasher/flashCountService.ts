// flashCountService.ts
// Real-time flash count tracking with Firebase Firestore & localStorage caching.

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAj8G4Y1uU0u4qDaWgmbQbzNlWi7BW-bqM',
  authDomain: 'easyesp-79b42.firebaseapp.com',
  projectId: 'easyesp-79b42',
  storageBucket: 'easyesp-79b42.firebasestorage.app',
  messagingSenderId: '281731498087',
  appId: '1:281731498087:web:739cd274e19053849314c2',
};

let db: any = null;
let isInitialized = false;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  isInitialized = true;
} catch (error) {
  console.warn('Firebase flash count initialization warning (using local mode):', error);
}

// LocalStorage helpers for offline resilience
export function getLocalFlashCount(projectId: string): number {
  try {
    const stored = localStorage.getItem(`k10_flash_count_${projectId}`);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setLocalFlashCount(projectId: string, count: number): void {
  try {
    localStorage.setItem(`k10_flash_count_${projectId}`, count.toString());
  } catch {}
}

/**
 * Retrieves the current successful flash count for a specific project.
 */
export async function getProjectFlashCount(projectId: string): Promise<number> {
  if (!projectId) return 0;
  const localVal = getLocalFlashCount(projectId);

  if (!isInitialized || !db) {
    return localVal;
  }

  try {
    const docRef = doc(db, 'project_stats', projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const count = typeof data.flashCount === 'number' ? data.flashCount : localVal;
      setLocalFlashCount(projectId, count);
      return count;
    }
    return localVal;
  } catch (error) {
    console.warn(`Could not read Firestore flash count for ${projectId}:`, error);
    return localVal;
  }
}

/**
 * Atomically increments the flash count for a project in Firestore & updates local cache.
 */
export async function incrementProjectFlashCount(projectId: string, version = ''): Promise<number> {
  if (!projectId) return 0;

  // Optimistic local increment
  const localCurrent = getLocalFlashCount(projectId);
  const newLocalCount = localCurrent + 1;
  setLocalFlashCount(projectId, newLocalCount);

  if (!isInitialized || !db) {
    return newLocalCount;
  }

  try {
    const docRef = doc(db, 'project_stats', projectId);

    const updateData: Record<string, any> = {
      projectId,
      flashCount: increment(1),
      lastFlashedAt: new Date().toISOString(),
    };

    if (version) {
      const cleanVerKey = `version_${version.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      updateData[cleanVerKey] = increment(1);
    }

    await setDoc(docRef, updateData, { merge: true });

    const updatedSnap = await getDoc(docRef);
    if (updatedSnap.exists()) {
      const updatedCount = updatedSnap.data().flashCount || newLocalCount;
      setLocalFlashCount(projectId, updatedCount);
      return updatedCount;
    }
    return newLocalCount;
  } catch (error) {
    console.warn(`Could not increment Firestore flash count for ${projectId}:`, error);
    return newLocalCount;
  }
}

/**
 * Subscribes to real-time flash count updates for a project.
 */
export function subscribeProjectFlashCount(
  projectId: string,
  callback: (count: number) => void
): () => void {
  if (!projectId || typeof callback !== 'function') return () => {};

  // Immediate callback with cached local count
  const initialLocal = getLocalFlashCount(projectId);
  callback(initialLocal);

  if (!isInitialized || !db) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'project_stats', projectId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const count = docSnap.data().flashCount || initialLocal;
          setLocalFlashCount(projectId, count);
          callback(count);
        }
      },
      (err) => {
        console.warn(`Firestore flash count subscription notice for ${projectId}:`, err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Error setting up Firestore subscription for ${projectId}:`, err);
    return () => {};
  }
}
