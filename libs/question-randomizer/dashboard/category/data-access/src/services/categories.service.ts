import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
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

  public getCategories(userId: string): Observable<Category[]> {
    const categoriesQuery = query(
      this.categoriesCollection,
      where('userId', '==', userId)
    );
    return collectionData(categoriesQuery, { idField: 'id' }) as Observable<
      Category[]
    >;
  }

  public createCategory(category: Category): Promise<void> {
    return addDoc(this.categoriesCollection, category).then(() => {});
  }

  public updateCategory(
    categoryId: string,
    data: Partial<Category>
  ): Promise<void> {
    const categoryDoc = doc(this.afDb, `categories/${categoryId}`);
    return updateDoc(categoryDoc, data);
  }
}
