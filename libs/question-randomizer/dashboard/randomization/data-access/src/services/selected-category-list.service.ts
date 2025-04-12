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
import { SelectedCategory } from '@my-nx-monorepo/question-randomizer-dashboard-randomization-util';

@Injectable({ providedIn: 'root' })
export class SelectedCategoryListService {
  constructor(private firestore: Firestore) {}

  async addCategoryToSelectedCategories(
    data: Omit<SelectedCategory, 'id'>
  ): Promise<SelectedCategory> {
    const ref = collection(this.firestore, 'selectedCategories');
    const docRef = await addDoc(ref, data);
    return { id: docRef.id, ...data };
  }

  async deleteCategoryFromSelectedCategories(
    categoryId: string,
    randomizationId: string
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

  async getSelectedCategoryList(
    randomizationId: string
  ): Promise<SelectedCategory[]> {
    const ref = collection(this.firestore, 'selectedCategories');
    const q = query(ref, where('randomizationId', '==', randomizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SelectedCategory[];
  }
}
