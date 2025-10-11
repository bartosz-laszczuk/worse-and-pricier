import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import {
  QuestionCategory,
  UsedQuestion,
} from '@worse-and-pricier/question-randomizer-dashboard-shared-util';
import { orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UsedQuestionListRepositoryService {
  private usedQuestionsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usedQuestionsCollection = collection(this.firestore, 'usedQuestions');
  }

  async addQuestionToUsedQuestions(
    randomizationId: string,
    usedQuestion: UsedQuestion
  ): Promise<string> {
    const docRef = await addDoc(this.usedQuestionsCollection, {
      ...usedQuestion,
      randomizationId,
      created: serverTimestamp(),
    });
    return docRef.id;
  }

  async deleteQuestionFromUsedQuestions(
    randomizationId: string,
    questionId: string
  ): Promise<void> {
    const q = query(
      this.usedQuestionsCollection,
      where('questionId', '==', questionId),
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);
    const deletions = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(this.usedQuestionsCollection, docSnap.id))
    );

    await Promise.all(deletions);
  }

  async getUsedQuestionIdListForRandomization(
    randomizationId: string
  ): Promise<UsedQuestion[]> {
    const q = query(
      this.usedQuestionsCollection,
      where('randomizationId', '==', randomizationId),
      orderBy('created', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const { questionId, categoryId } = docSnap.data();
      return { questionId, categoryId };
    });
  }

  async deleteAllUsedQuestionsFromRandomization(
    randomizationId: string
  ): Promise<void> {
    const q = query(
      this.usedQuestionsCollection,
      where('randomizationId', '==', randomizationId)
    );

    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(doc(this.usedQuestionsCollection, docSnap.id));
    });

    await batch.commit();
  }

  // async deleteQuestionsFromUsedQuestionsByCategoryId(
  //   randomizationId: string,
  //   categoryId: string
  // ): Promise<void> {
  //   const q = query(
  //     this.usedQuestionsCollection,
  //     where('randomizationId', '==', randomizationId),
  //     where('categoryId', '==', categoryId)
  //   );

  //   const snapshot = await getDocs(q);

  //   const batch = writeBatch(this.firestore);
  //   snapshot.docs.forEach((docSnap) => {
  //     batch.delete(doc(this.usedQuestionsCollection, docSnap.id));
  //   });

  //   await batch.commit();
  // }

  async resetUsedQuestionsCategoryId(
    randomizationId: string,
    categoryId: string
  ): Promise<void> {
    const q = query(
      this.usedQuestionsCollection,
      where('randomizationId', '==', randomizationId),
      where('categoryId', '==', categoryId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach((docSnap) => {
      const docRef = doc(this.usedQuestionsCollection, docSnap.id);
      batch.update(docRef, { categoryId: null });
    });

    await batch.commit();
  }

  async updateUsedQuestionCategoryId(
    newQuestionCategory: QuestionCategory
  ): Promise<void> {
    const q = query(
      this.usedQuestionsCollection,
      where('questionId', '==', newQuestionCategory.questionId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);

    snapshot.docs.forEach((docSnap) => {
      const docRef = doc(this.usedQuestionsCollection, docSnap.id);
      batch.update(docRef, {
        categoryId: newQuestionCategory.categoryId || null,
      });
    });

    await batch.commit();
  }
}
