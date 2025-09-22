import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc,setDoc } from '@angular/fire/firestore';



@Injectable({
  providedIn: 'root'
})
export class Query {
  constructor(
    private readonly fst: Firestore,
  ) {}

  async create(collectionName: string, data: any) {
    try {
      const ref = collection(this.fst, collectionName);
      const res = await addDoc(ref, data);
    } catch (error) {
      console.log(error);
    }
  }

  async update(collectionName: string, uuid: string, data: any) {
    try {
      const docRef = doc(this.fst, collectionName, uuid);
      await updateDoc(docRef, data);
    } catch (error) {
      console.log((error as any).message);
    }
  }

  async set(collectionName: string, uid: string, data: any) {
    try {
      const ref = doc(this.fst, collectionName, uid);
      await setDoc(ref, data);
    } catch (error) {
      console.log(error);
    }
  }
}
