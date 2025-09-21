import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from 'src/environments/environment';
import { Auth } from '../provide/auth/auth';
import { Query } from '../provide/query/query';
import { File } from '../provide/provide/file';
import { NativeToast } from './providers/nativeToast/native-toast';
import { Capacitor } from '@capacitor/core';






const providers = [Auth, Query, File, NativeToast];

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    ...providers
  ]
})
export class CoreModule implements OnInit {
    constructor(private readonly fileSrv: File) {
      if (Capacitor.isNativePlatform()) {
         this.ngOnInit()      
        }
    }
    
  async ngOnInit(){
    this.fileSrv.requestPermissions();

  }
}




