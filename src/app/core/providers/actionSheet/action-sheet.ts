import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ActionSheet {
  
  constructor(
    private actionSheetCtrl: ActionSheetController,
  ) {}

  async present(header: string, buttons: any[]) {
    const aSheet = await this.actionSheetCtrl.create({
      header,
      buttons,
    });
    await aSheet.present();
    return aSheet;
  }

}