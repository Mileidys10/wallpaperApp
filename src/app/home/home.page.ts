import { Component, OnInit } from '@angular/core';
import { User } from '../services/user/user';
import { Router } from '@angular/router';
import { File } from 'src/app/provide/provide/file';
import { IImage } from '../interfaces/image';
import { Uploader } from '../core/providers/uploader/uploader';
import { ActionSheet } from '../core/providers/actionSheet/action-sheet';
import { Loading } from '../core/providers/loading/loading';
import { Translate } from '../core/providers/translator/translate';
import { NativeToast } from '../core/providers/nativeToast/native-toast';
import {  WallpaperType } from '../services/wallpaper/wallpaper-service';
import { Capacitor } from '@capacitor/core';
import { WallpaperService } from '../services/wallpaper/wallpaper-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  public image!: IImage;
  public imgs: string[] = [];
  public isLoading = false;
  public selectedImageUrl = '';

  constructor(
    private readonly fileSrv: File,
    private userSrv: User,
    private readonly router: Router,
    private readonly uploaderSrv: Uploader,
    private actionSheetSrv: ActionSheet,
    private loadingSrv: Loading,
    private translateSrv: Translate,
    private nativeToast: NativeToast,
    private wallpaperSrv: WallpaperService
  ) {}

  async ngOnInit() {
    await this.loadUserWallpapers();
  }

  private async loadUserWallpapers() {
    try {
      this.isLoading = true;
      const savedWallpapers = await this.userSrv.getUserWallpapers();
      this.imgs = savedWallpapers;
    } catch (error) {
      console.error('Error loading wallpapers:', error);
      await this.nativeToast.show('Error cargando imágenes guardadas');
    } finally {
      this.isLoading = false;
    }
  }

  public onButtonClick(action: string) {
    switch (action) {
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
  goToProfile() {
    throw new Error('Method not implemented.');
  }
  pickImage() {
    throw new Error('Method not implemented.');
  }
  logOut() {
    throw new Error('Method not implemented.');
  }

  public openActions(imageUrl?: string) {
    if (imageUrl) {
      this.selectedImageUrl = imageUrl;
    }

    const buttons = [
      {
        text: this.translateSrv.instant('HOME.SET_HOME_WALLPAPER') || 'Set as Home Wallpaper',
        icon: 'home-outline',
        handler: () => this.setWallpaper(WallpaperType.HOME_SCREEN),
      },
      {
        text: this.translateSrv.instant('HOME.SET_LOCK_WALLPAPER') || 'Set as Lock Wallpaper',
        icon: 'lock-closed-outline',
        handler: () => this.setWallpaper(WallpaperType.LOCK_SCREEN),
      },
      {
        text: this.translateSrv.instant('HOME.SET_BOTH_WALLPAPER') || 'Set as Both Wallpapers',
        icon: 'phone-portrait-outline',
        handler: () => this.setWallpaper(WallpaperType.BOTH),
      },
      {
        text: this.translateSrv.instant('HOME.CANCEL') || 'Cancel',
        role: 'cancel',
        icon: 'close-outline'
      },
    ];

    this.actionSheetSrv.present(
      this.translateSrv.instant('HOME.WALLPAPER_ACTIONS') || 'Wallpaper Actions',
      buttons
    );
  }

  private async setWallpaper(type: WallpaperType) {
    if (!this.selectedImageUrl) {
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.NO_IMAGE_SELECTED') || 'No image selected'
      );
      return;
    }

    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.SETTING_WALLPAPER') || 'Setting wallpaper...'
      });

      const imagePath = await this.wallpaperSrv.prepareImagePath(this.selectedImageUrl);
      
      const success = await this.wallpaperSrv.setWallpaper(imagePath, type);
      
      

    } catch (error) {
      console.error('Error setting wallpaper:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.WALLPAPER_ERROR') || 'Error setting wallpaper'
      );
    } finally {
      await this.loadingSrv.dimiss();
      this.selectedImageUrl = ''; 
    }
  }
}