import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class SelectedCategoryListRepositoryService {
  constructor(private firestore: Firestore) {}

  async addCategoryToRandomization(
    randomizationId: string,
    categoryId: string
  ): Promise<string> {
    const ref = collection(this.firestore, 'selectedCategories');
    const docRef = await addDoc(ref, {
      randomizationId,
      categoryId,
      created: serverTimestamp(),
    });
    return docRef.id;
  }

  async addMultipleCategoriesToRandomization(
    randomizationId: string,
    categoryIdList: string[]
  ): Promise<void> {
    const batch = writeBatch(this.firestore);
    const ref = collection(this.firestore, 'selectedCategories');

    categoryIdList.forEach((categoryId) => {
      const newDocRef = doc(ref); // auto-ID
      batch.set(newDocRef, {
        randomizationId,
        categoryId,
        created: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async deleteSelectedCategoryFromRandomization(
    randomizationId: string,
    categoryId: string
  ): Promise<void> {
    const ref = collection(this.firestore, 'selectedCategories');
    const q = query(
      ref,
      where('categoryId', '==', categoryId),
      where('randomizationId', '==', randomizationId)
    );
    const snapshot = await getDocs(q);
    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
  }

  async getSelectedCategoryIdListForRandomiozation(
    randomizationId: string
  ): Promise<string[]> {
    const ref = collection(this.firestore, 'selectedCategories');
    const q = query(ref, where('randomizationId', '==', randomizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()['categoryId']) as string[];
  }
}
