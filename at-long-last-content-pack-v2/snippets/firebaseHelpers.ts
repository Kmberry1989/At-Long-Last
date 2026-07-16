/**
 * firebaseHelpers.ts
 * Helpers for pairing and presence
 * Drop into src/features/couple/firebaseHelpers.ts
 */

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Pairing: simple invite code flow
export async function createInviteCode(db: any, coupleId: string, ownerUid: string) {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase(); // e.g. 4F8K
  await setDoc(doc(db, 'invites', code), {
    coupleId,
    ownerUid,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24*60*60*1000) // 24h
  });
  return code;
}

export async function redeemInviteCode(db: any, code: string, joinerUid: string) {
  const inviteRef = doc(db, 'invites', code.toUpperCase());
  const snap = await getDoc(inviteRef);
  if (!snap.exists()) throw new Error('Invalid code');
  const data = snap.data();
  if (data.expiresAt.toDate() < new Date()) throw new Error('Code expired');

  // add joiner to couple
  const coupleRef = doc(db, 'couples', data.coupleId);
  await updateDoc(coupleRef, {
    memberIds: [...new Set([...(data.memberIds || [data.ownerUid]), joinerUid])],
    pairedAt: serverTimestamp()
  });
  return data.coupleId;
}

// Firestore rules suggestion (put in firestore.rules)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isMember(coupleId) {
      return request.auth != null && request.auth.uid in get(/databases/$(database)/documents/couples/$(coupleId)).data.memberIds;
    }
    match /couples/{coupleId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
    }
    match /sessions/{sessionId} {
      allow read, write: if isMember(resource.data.coupleId);
      allow create: if isMember(request.resource.data.coupleId);
    }
    match /journalEntries/{entryId} {
      allow read, write: if isMember(resource.data.coupleId);
      allow create: if isMember(request.resource.data.coupleId);
    }
    match /invites/{code} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
*/
