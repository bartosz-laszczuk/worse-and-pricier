import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { lastValueFrom, Observable, take } from 'rxjs';
import { CreateCategoryRequest } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly afDb = inject(Firestore);

  private categoriesCollection = collection(this.afDb, 'categories');

  public getCategoryById(categoryId: string): Promise<Category | undefined> {
    const categoryDoc = doc(this.afDb, `categories/${categoryId}`);
    return getDoc(categoryDoc).then((snapshot) => {
      return snapshot.exists()
        ? ({ id: snapshot.id, ...snapshot.data() } as Category)
        : undefined;
    });
  }

  public getCategories(userId: string): Promise<Category[]> {
    const categoriesQuery = query(
      this.categoriesCollection,
      where('userId', '==', userId)
    );
    return lastValueFrom(
      (
        collectionData(categoriesQuery, { idField: 'id' }) as Observable<
          Category[]
        >
      ).pipe(take(1))
    );
  }

  public async createCategory(
    category: Category,
    userId: string
  ): Promise<string> {
    const request: CreateCategoryRequest = { name: category.name, userId };
    const docRef = await addDoc(this.categoriesCollection, request);
    return docRef.id;
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    const categoryDoc = doc(this.afDb, `categories/${categoryId}`);
    return await deleteDoc(categoryDoc);
  }

  public updateCategory(
    categoryId: string,
    data: Partial<Category>
  ): Promise<void> {
    const categoryDoc = doc(this.afDb, `categories/${categoryId}`);
    return updateDoc(categoryDoc, data);
  }
}
