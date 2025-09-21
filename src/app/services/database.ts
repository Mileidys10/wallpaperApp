import { Injectable } from '@angular/core';
import { Firestore,getFirestore,addDoc,collection,getDoc } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'

})
export class Database {
  private database=getFirestore();

  constructor(){

  }
  public addDocument(data:any,collectionName:string){
    const collectionRef=collection(this.database,collectionName);
    return addDoc(collectionRef,data);
  }
}