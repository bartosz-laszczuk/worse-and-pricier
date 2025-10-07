import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import {
  CreateRandomzationRequest,
  GetRandomizationResponse,
  UpdateRandomzationRequest,
} from '../models';
import {
  Randomization,
  RandomizationStatus,
} from '@worse-and-pricier/question-randomizer-dashboard-randomization-util';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

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

  async createRandomization(userId: string): Promise<string> {
    const randomizationsRef = collection(this.firestore, this.collectionName);

    const request: CreateRandomzationRequest = {
      showAnswer: false,
      status: RandomizationStatus.Ongoing,
      created: serverTimestamp(),
      userId,
    };

    const docRef = await addDoc(randomizationsRef, request);

    return docRef.id;
  }

  async updateRandomization(randomization: Randomization) {
    const request: UpdateRandomzationRequest = {
      showAnswer: randomization.showAnswer,
      status: randomization.status,
      currentQuestionId: randomization.currentQuestion?.id ?? null,
    };

    const randomizationDocRef = doc(
      this.firestore,
      this.collectionName,
      randomization.id
    );
    await updateDoc(randomizationDocRef, { ...request });
  }

  async clearCurrentQuestion(randomizationId: string) {
    const randomizationDocRef = doc(
      this.firestore,
      this.collectionName,
      randomizationId
    );

    await updateDoc(randomizationDocRef, {
      currentQuestionId: null,
    });
  }
}
