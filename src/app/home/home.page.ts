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

  constructor(
    private readonly fileSrv: File,
    private userSrv: User,
    private readonly router: Router,
    private readonly uploaderSrv: Uploader,
    private actionSheetSrv: ActionSheet,
    private loadingSrv: Loading,
    private translateSrv: Translate,
    private nativeToast: NativeToast
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

  public openActions() {
    this.actionSheetSrv.present(
      this.translateSrv.instant('HOME.ACTIONS'),
      [
        {
          text: this.translateSrv.instant('HOME.LOCKSCREAN'),
          handler: () => console.log('Putting lock screen...'),
        },
        {
          text: this.translateSrv.instant('HOME.HOMESCREAN'),
          handler: () => console.log('Putting home screen...'),
        },
        {
          text: this.translateSrv.instant('HOME.CANCEL'),
          role: 'cancel'
        },
      ]
    );
  }

  public goToProfile() {
    this.router.navigate(['/profile']);
  }

  public async pickImage() {
    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.UPLOADING') || 'Subiendo imagen...'
      });

      this.image = await this.fileSrv.pickImage();
      
      const path = await this.uploaderSrv.upload(
        "images",
        `${Date.now()}-${this.image.name}`,
        this.image.mimeType,
        this.image.data
      );

      const imageUrl = await this.uploaderSrv.getUrl("images", path);

      await this.userSrv.addWallpaper(path, imageUrl);

      this.imgs = [imageUrl, ...this.imgs];

      await this.nativeToast.show(
        this.translateSrv.instant('HOME.IMAGE_UPLOADED') || 'Imagen subida correctamente'
      );

    } catch (error) {
      console.error('Error uploading image:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.ERROR_UPLOADING') || 'Error al subir la imagen'
      );
    } finally {
      await this.loadingSrv.dimiss();
    }
  }

  public async deleteImage(imageUrl: string, index: number) {
    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.DELETING') || 'Eliminando...'
      });

      await this.userSrv.removeWallpaper(imageUrl);

      this.imgs.splice(index, 1);

      await this.nativeToast.show(
        this.translateSrv.instant('HOME.IMAGE_DELETED') || 'Imagen eliminada'
      );

    } catch (error) {
      console.error('Error deleting image:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.ERROR_DELETING') || 'Error al eliminar la imagen'
      );
    } finally {
      await this.loadingSrv.dimiss();
    }
  }

  public async logOut() {
    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.LOGGING_OUT') || 'Cerrando sesión...'
      });
      
      await this.userSrv.logOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      await this.loadingSrv.dimiss();
    }
  }

  public async refreshImages(event?: any) {
    await this.loadUserWallpapers();
    if (event) {
      event.target.complete();
    }
  }
}