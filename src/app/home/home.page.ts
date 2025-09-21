import { Component , OnInit, ViewChild} from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { User } from '../services/user/user';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';

import { File } from 'src/app/provide/provide/file';
import { IImage } from '../interfaces/image';
import { Uploader } from '../core/providers/uploader/uploader';
import { ActionSheet } from '../core/providers/actionSheet/action-sheet';
import { Loading } from '../core/providers/loading/loading';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  public image!: IImage;
  public imgs: string[] = [];
  public groupedImgs: string[][] = [];

  constructor(
    private readonly fileSrv: File,
    private userSrv: User,
    private readonly router: Router,
        private readonly uploaderSrv: Uploader,
         private actionSheetSrv: ActionSheet,
          private loadingSrv: Loading


  ) { }

  ngOnInit() {
  }

 public onButtonClick(action: string) {
    switch(action) {

      case 'logout':
        this.logOut();
        break;
      
      case 'add':
        this.pickImage();
        break;
      
      case 'profile':
        this.goToProfile();
        break;

      default:
        console.warn('Action not found: ', action);
    }
  }

public openActions() {
    this.actionSheetSrv.present('Actions', [
      {
        text: 'Lock screan',
        handler: () => console.log('Putting lock screan...'),
      },
      {
        text: 'Home screan',
        handler: () => console.log('Putting home screan...'),
      },
      {
        text: 'Cancel',
        role: 'cancel'
      },
    ]);
  }
public goToProfile() {
    console.log("Go to profile...");
  }

  public async pickImage() {
    this.image = await this.fileSrv.pickImage();
    const path = await this.uploaderSrv.upload(

      "images",
      `${Date.now()}-${this.image.name}`,
      this.image.mimeType,
      this.image.data
    );
         const imge = await this.uploaderSrv.getUrl("images", path);
    this.imgs = [imge, ...this.imgs];

  }

  public async logOut() {
    await this.userSrv.logOut()
    this.router.navigate(['/']);
  }

}