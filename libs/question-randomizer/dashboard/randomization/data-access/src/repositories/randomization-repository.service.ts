import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { CreateRandomzationRequest, GetRandomizationResponse } from '../models';
import { RandomizationStatus } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';
import { serverTimestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class RandomizationRepositoryService {
  private readonly collectionName = 'randomizations';

  constructor(private firestore: Firestore) {}

  async getRandomization(
    userId: string
  ): Promise<GetRandomizationResponse | null> {
    const randomizationsRef = collection(this.firestore, this.collectionName);
    const q = query(randomizationsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data() as GetRandomizationResponse;

    return {
      ...data,
      id: docSnap.id,
    };
  }

  /**
   * Creates a new randomization and returns its generated ID.
   */
  async createRandomization(userId: string): Promise<string> {
    const randomizationsRef = collection(this.firestore, this.collectionName);

    const request: CreateRandomzationRequest = {
      isAnswerHidden: true,
      status: RandomizationStatus.Ongoing,
      created: serverTimestamp(),
      userId,
    };

    const docRef = await addDoc(randomizationsRef, request);

    return docRef.id;
  }
}
