import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NativeToast } from '../../core/providers/nativeToast/native-toast';
import { Translate } from '../../core/providers/translator/translate';
import { Wallpaper } from 'src/plugins/wallpaper';

export enum WallpaperType {
  HOME_SCREEN = 'home',
  LOCK_SCREEN = 'lock',
  BOTH = 'both'
}

@Injectable({
  providedIn: 'root'
})
export class WallpaperService {

  constructor(
    private nativeToast: NativeToast,
    private translateSrv: Translate
  ) {}

  
  async setWallpaper(imagePath: string, type: WallpaperType): Promise<boolean> {
    try {
      

      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          await this.nativeToast.show(
            this.translateSrv.instant('WALLPAPER.PERMISSION_DENIED') || 
            'Permiso denegado para establecer fondo de pantalla'
          );
          return false;
        }
      }

      let result;
      
      switch (type) {
        case WallpaperType.HOME_SCREEN:
          result = await Wallpaper.setHomeScreenWallpaper({ imagePath });
          break;
        case WallpaperType.LOCK_SCREEN:
          result = await Wallpaper.setLockScreenWallpaper({ imagePath });
          break;
        case WallpaperType.BOTH:
          result = await Wallpaper.setBothWallpaper({ imagePath });
          break;
        default:
          throw new Error('Tipo de wallpaper inválido');
      }

      if (result.success) {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.SUCCESS') || 
          'Fondo de pantalla establecido correctamente'
        );
        return true;
      } else {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.ERROR') || 
          'Error al establecer el fondo de pantalla'
        );
        return false;
      }

    } catch (error) {
      console.error('Error setting wallpaper:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('WALLPAPER.UNEXPECTED_ERROR') || 
        'Ocurrió un error inesperado'
      );
      return false;
    }
  }

 
  async setHomeScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.HOME_SCREEN);
  }

  
  async setLockScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.LOCK_SCREEN);
  }

  
  async setBothWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.BOTH);
  }


  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return false;
      
      const result = await Wallpaper.checkPermissions();
      return result.granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return false;
      
      const result = await Wallpaper.requestPermissions();
      return result.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  
  async prepareImagePath(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('file://') || imageUrl.startsWith('/')) {
      return imageUrl;
    }

    
    return imageUrl;
  }

 
  getPlatformInfo(): string {
    const platform = Capacitor.getPlatform();
    return `Plataforma: ${platform}, Nativa: ${Capacitor.isNativePlatform()}`;
  }
}