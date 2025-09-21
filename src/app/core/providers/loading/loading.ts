import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { __awaiter } from 'tslib';

@Injectable({
  providedIn: 'root'
})
export class Loading {

  constructor(
    private readonly loadingCtrl: LoadingController,
  ) {}

  async present(payload: { msg: string }) {
    const loading = await this.loadingCtrl.create({
      message: payload.msg,
    });
    await loading.present();
  }

  async dimiss() {
    await this.loadingCtrl.dismiss();
  }
  
}