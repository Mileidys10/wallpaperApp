import { WebPlugin } from '@capacitor/core';
import type { WallpaperPlugin } from './definitions';

export class WallpaperWeb extends WebPlugin implements WallpaperPlugin {
  async setHomeScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }> {
    console.log('setHomeScreenWallpaper called with:', options);
    return {
      success: false,
      message: 'Setting wallpaper is not supported in web browsers'
    };
  }

  async setLockScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }> {
    console.log('setLockScreenWallpaper called with:', options);
    return {
      success: false,
      message: 'Setting wallpaper is not supported in web browsers'
    };
  }

  async setBothWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }> {
    console.log('setBothWallpaper called with:', options);
    return {
      success: false,
      message: 'Setting wallpaper is not supported in web browsers'
    };
  }

  async checkPermissions(): Promise<{ granted: boolean }> {
    console.log('checkPermissions called');
    return { granted: false };
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    console.log('requestPermissions called');
    return { granted: false };
  }
}