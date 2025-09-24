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
import { Capacitor } from '@capacitor/core';
import { WallpaperType, WallpaperService } from '../services/wallpaper/wallpaper-service';

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

  public async logOut() {
    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.LOGGING_OUT') || 'Cerrando sesión...'
      });
      
      await this.userSrv.logOut();
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('Error logging out:', error);
      await this.nativeToast.show('Error al cerrar sesión');
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

  public openActions(imageUrl?: string) {
    if (imageUrl) {
      this.selectedImageUrl = imageUrl;
    }

    const buttons = [
      {
        text: this.translateSrv.instant('HOME.SET_HOME_WALLPAPER') || 'Establecer como Fondo de Inicio',
        icon: 'home-outline',
        handler: () => this.setWallpaper(WallpaperType.HOME_SCREEN),
      },
      {
        text: this.translateSrv.instant('HOME.SET_LOCK_WALLPAPER') || 'Establecer como Fondo de Bloqueo',
        icon: 'lock-closed-outline',
        handler: () => this.setWallpaper(WallpaperType.LOCK_SCREEN),
      },
      {
        text: this.translateSrv.instant('HOME.SET_BOTH_WALLPAPER') || 'Establecer para Ambas Pantallas',
        icon: 'phone-portrait-outline',
        handler: () => this.setWallpaper(WallpaperType.BOTH),
      },
      {
        text: this.translateSrv.instant('HOME.CANCEL') || 'Cancelar',
        role: 'cancel',
        icon: 'close-outline'
      },
    ];

    this.actionSheetSrv.present(
      this.translateSrv.instant('HOME.WALLPAPER_ACTIONS') || 'Opciones de Wallpaper',
      buttons
    );
  }

  private async setWallpaper(type: WallpaperType) {
    if (!this.selectedImageUrl) {
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.NO_IMAGE_SELECTED') || 'No hay imagen seleccionada'
      );
      return;
    }

    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('HOME.SETTING_WALLPAPER') || 'Estableciendo fondo de pantalla...'
      });

      const imagePath = await this.wallpaperSrv.prepareImagePath(this.selectedImageUrl);
      
      const success = await this.wallpaperSrv.setWallpaper(imagePath, type);
      
      if (success) {
        console.log('Wallpaper establecido correctamente');
      }

    } catch (error) {
      console.error('Error setting wallpaper:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('HOME.WALLPAPER_ERROR') || 'Error al establecer el fondo de pantalla'
      );
    } finally {
      await this.loadingSrv.dimiss();
      this.selectedImageUrl = ''; 
    }
  }

  public async refreshImages(event?: any) {
    try {
      await this.loadUserWallpapers();
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }
}