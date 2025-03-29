import { inject, Injectable } from '@angular/core';
import { EmailPasswordCredentials } from '@my-nx-monorepo/question-randomizer-auth-util';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  docData,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
import { APP_CONFIG } from '@my-nx-monorepo/question-randomizer-shared-util';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly afAuth = inject(Auth);
  private readonly afDb = inject(Firestore);
  private readonly appConfig = inject(APP_CONFIG);

  public async signInEmail(
    credentials: EmailPasswordCredentials
  ): Promise<User | undefined> {
    const signInState = await signInWithEmailAndPassword(
      this.afAuth,
      credentials.email,
      credentials.password
    );
    if (!signInState.user) throw new Error('User not found');

    return firstValueFrom(
      docData(doc(this.afDb, `users/${signInState.user.uid}`))
    ) as Promise<User | undefined>;
  }

  public async getAuthenticatedUser(): Promise<{
    uid: string;
    entity: User | null;
  } | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(
        this.afAuth,
        async (authState: FirebaseUser | null) => {
          if (!authState) return resolve(null);

          const userDoc = await getDoc(
            doc(this.afDb, `users/${authState.uid}`)
          );
          resolve({
            uid: authState.uid,
            entity: userDoc.exists() ? (userDoc.data() as User) : null,
          });
        }
      );
    });
  }

  public async signUpEmail(
    credentials: EmailPasswordCredentials
  ): Promise<string> {
    const signUpState = await createUserWithEmailAndPassword(
      this.afAuth,
      credentials.email,
      credentials.password
    );
    if (!signUpState.user) throw new Error('User registration failed');

    await sendEmailVerification(
      signUpState.user,
      this.appConfig.firebase.actionCodeSettings
    );
    return signUpState.user.uid;
  }

  public async signOut(): Promise<void> {
    await signOut(this.afAuth);
  }

  public async createUser(request: Partial<User>): Promise<User> {
    const authState = this.afAuth.currentUser;
    if (!authState) throw new Error('No authenticated user found');

    const entity: User = {
      ...request,
      uid: authState.uid,
      email: authState.email ?? '',
      created: serverTimestamp(),
    } as User;

    await setDoc(doc(this.afDb, `users/${entity.uid}`), entity);
    return entity;
  }

  public async updateUser(entity: User): Promise<User> {
    await setDoc(doc(this.afDb, `users/${entity.uid}`), entity, {
      merge: true,
    });
    return entity;
  }
}
