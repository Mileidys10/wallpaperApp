export interface WallpaperPlugin {
  /**
   * Establece una imagen como wallpaper de pantalla de inicio
   */
  setHomeScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;

  /**
   * Establece una imagen como wallpaper de pantalla de bloqueo
   */
  setLockScreenWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;

  /**
   * Establece una imagen como wallpaper tanto de inicio como de bloqueo
   */
  setBothWallpaper(options: { imagePath: string }): Promise<{ success: boolean; message?: string }>;

  /**
   * Verifica si el dispositivo tiene permisos para establecer wallpapers
   */
  checkPermissions(): Promise<{ granted: boolean }>;

  /**
   * Solicita permisos para establecer wallpapers (si es necesario)
   */
  requestPermissions(): Promise<{ granted: boolean }>;
}