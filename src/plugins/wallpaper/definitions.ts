export interface WallpaperPlugin {
  
  setHomeScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;


  setLockScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;

  
  setBothWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;

  
  checkPermissions(): Promise<{ granted: boolean }>;

 
  requestPermissions(): Promise<{ granted: boolean }>;
}