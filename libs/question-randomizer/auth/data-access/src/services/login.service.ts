import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  EmailPasswordCredentials,
  LoginForm,
} from '@my-nx-monorepo/question-randomizer-auth-util';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models';
import { firstValueFrom } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';

@Injectable()
export class LoginService {
  private readonly fb = inject(FormBuilder);
  private readonly afAuth = inject(AngularFireAuth);
  private readonly afDb = inject(AngularFirestore);

  public form = this.fb.group<LoginForm>({
    email: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(128),
        Validators.email,
      ],
      nonNullable: true,
    }),
    password: this.fb.control<string>('', {
      validators: [Validators.required, Validators.maxLength(128)],
      nonNullable: true,
    }),
  });

  public async signInEmail(
    credentials: EmailPasswordCredentials
  ): Promise<User | undefined> {
    const signInState = await this.afAuth.signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    );

    if (!signInState.user) throw new Error('User not found');

    return firstValueFrom(
      this.afDb.doc<User>(`users/${signInState.user.uid}`).valueChanges()
    );
  }

  public async getAuthenticatedUser(): Promise<{
    uid: string;
    entity: User | null;
  } | null> {
    const authState = await firstValueFrom(this.afAuth.authState);

    if (!authState) return null; // No authenticated user

    const entity = await firstValueFrom(
      this.afDb.doc<User>(`users/${authState.uid}`).valueChanges()
    );

    return { uid: authState.uid, entity: entity || null };
  }

  public async signUpEmail(
    credentials: EmailPasswordCredentials
  ): Promise<string> {
    const signUpState = await this.afAuth.createUserWithEmailAndPassword(
      credentials.email,
      credentials.password
    );

    if (!signUpState.user) throw new Error('User registration failed');

    // Send email verification
    await signUpState.user.sendEmailVerification(
      environment.firebase.actionCodeSettings
    );

    return signUpState.user.uid;
  }

  public async signOut(): Promise<void> {
    await this.afAuth.signOut();
  }

  public async createUser(request: Partial<User>): Promise<User> {
    const authState = await firstValueFrom(this.afAuth.authState);
    if (!authState) throw new Error('No authenticated user found');

    const entity: User = {
      ...request,
      uid: authState.uid,
      email: authState.email,
      created: serverTimestamp(),
    } as User;

    await this.afDb.collection('users').doc(entity.uid).set(entity);
    return entity;
  }

  public async updateUser(entity: User): Promise<User> {
    await this.afDb
      .collection('users')
      .doc(entity.uid)
      .set(entity, { merge: true });
    return entity;
  }
}
