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
import { Loading } from './providers/loading/loading';
import { Translate } from './providers/translator/translate';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';




export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

const providers = [Auth, Query, File, NativeToast, Loading, Translate];






@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    }),
   ],

  exports: [TranslateModule],



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




