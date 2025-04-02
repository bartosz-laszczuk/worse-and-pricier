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
import { Qualification } from '@my-nx-monorepo/question-randomizer-dashboard-shared-util';
import { lastValueFrom, Observable, take } from 'rxjs';
import { CreateQualificationRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class QualificationService {
  private readonly afDb = inject(Firestore);

  private qualificationsCollection = collection(this.afDb, 'qualifications');

  public getQualificationById(
    qualificationId: string
  ): Promise<Qualification | undefined> {
    const qualificationDoc = doc(
      this.afDb,
      `qualifications/${qualificationId}`
    );
    return getDoc(qualificationDoc).then((snapshot) => {
      return snapshot.exists()
        ? ({ id: snapshot.id, ...snapshot.data() } as Qualification)
        : undefined;
    });
  }

  public getQualifications(userId: string): Promise<Qualification[]> {
    const qualificationsQuery = query(
      this.qualificationsCollection,
      where('userId', '==', userId)
    );
    return lastValueFrom(
      (
        collectionData(qualificationsQuery, { idField: 'id' }) as Observable<
          Qualification[]
        >
      ).pipe(take(1))
    );
  }

  public async createQualification(
    qualification: Qualification,
    userId: string
  ): Promise<string> {
    const request: CreateQualificationRequest = {
      name: qualification.name,
      userId,
    };
    const docRef = await addDoc(this.qualificationsCollection, request);
    return docRef.id;
  }

  public async deleteQualification(qualificationId: string): Promise<void> {
    const qualificationDoc = doc(
      this.afDb,
      `qualifications/${qualificationId}`
    );
    return await deleteDoc(qualificationDoc);
  }

  public updateQualification(
    qualificationId: string,
    data: Partial<Qualification>
  ): Promise<void> {
    const qualificationDoc = doc(
      this.afDb,
      `qualifications/${qualificationId}`
    );
    return updateDoc(qualificationDoc, data);
  }
}
