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

  /**
   * Establece una imagen como wallpaper
   */
  async setWallpaper(imagePath: string, type: WallpaperType): Promise<boolean> {
    try {
      // Verificar si es plataforma nativa
      if (!Capacitor.isNativePlatform()) {
        await this.nativeToast.show(
          this.translateSrv.instant('WALLPAPER.NOT_SUPPORTED_WEB') || 
          'Setting wallpaper is not supported in web browsers'
        );
        return false;
      }

      // Verificar permisos primero
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          await this.nativeToast.show(
            this.translateSrv.instant('WALLPAPER.PERMISSION_DENIED') || 
            'Permission denied to set wallpaper'
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
          throw new Error('Invalid wallpaper type');
      }

      if (result.success) {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.SUCCESS') || 
          'Wallpaper set successfully'
        );
        return true;
      } else {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.ERROR') || 
          'Error setting wallpaper'
        );
        return false;
      }

    } catch (error) {
      console.error('Error setting wallpaper:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('WALLPAPER.UNEXPECTED_ERROR') || 
        'Unexpected error occurred'
      );
      return false;
    }
  }

  /**
   * Establece wallpaper para pantalla de inicio
   */
  async setHomeScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.HOME_SCREEN);
  }

  /**
   * Establece wallpaper para pantalla de bloqueo
   */
  async setLockScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.LOCK_SCREEN);
  }

  /**
   * Establece wallpaper para ambas pantallas
   */
  async setBothWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.BOTH);
  }

  /**
   * Verifica si la app tiene permisos para establecer wallpapers
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const result = await Wallpaper.checkPermissions();
      return result.granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Solicita permisos para establecer wallpapers
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await Wallpaper.requestPermissions();
      return result.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Convierte una URL de imagen a un path local (si es necesario)
   */
  async prepareImagePath(imageUrl: string): Promise<string> {
    // Si ya es un path local, devolverlo tal como está
    if (imageUrl.startsWith('file://') || imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Si es una URL HTTP, podríamos necesitar descargarla primero
    // Para este ejemplo, asumimos que las imágenes ya están almacenadas localmente
    // o que el plugin puede manejar URLs remotas
    return imageUrl;
  }
}