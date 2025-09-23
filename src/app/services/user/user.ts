import { Injectable } from '@angular/core';
import { IUserCreate } from 'src/app/interfaces/user-interface';
import { Auth } from 'src/app/provide/auth/auth';
import { Query } from 'src/app/provide/query/query';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export interface IWallpaper {
  path: string;
  url: string;
  createdAt: number;
}

export interface IUserData {
  uid: string;
  name: string;
  lastName: string;
  wallpapers: IWallpaper[];
}

@Injectable({
  providedIn: 'root'
})
export class User {

  constructor(
    private readonly authSrv: Auth,
    private readonly querySrv: Query,
    private readonly firestore: Firestore,
  ) {}

  async create(user: IUserCreate): Promise<void> {
    try {
      const uid = await this.authSrv.register(user.email, user.password);
      await this.querySrv.set("users", uid, {
        uid,
        name: user.name,
        lastName: user.lastName,
        wallpapers: [] 
      });
      await this.logOut();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async UpdateUser(name: string, lastName: string) {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');
      
      await this.querySrv.update('users', uuid, {
        name: name,
        lastName: lastName
      });
      return uuid;
    } catch (error) {
      const errorMsg = this.extractTextInParentheses((error as any).message) || "Error desconocido";
      throw new Error(errorMsg);
    }
  }

  public async addWallpaper(path: string, url: string): Promise<void> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');

      const userData = await this.getUserData();
      const currentWallpapers = userData?.wallpapers || [];

      const newWallpaper: IWallpaper = {
        path,
        url,
        createdAt: Date.now()
      };

      const updatedWallpapers = [newWallpaper, ...currentWallpapers];

      await this.querySrv.update('users', uuid, {
        wallpapers: updatedWallpapers
      });

    } catch (error) {
      console.error('Error adding wallpaper:', error);
      throw error;
    }
  }

  public async getUserData(): Promise<IUserData | null> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) return null;

      const userDoc = doc(this.firestore, 'users', uuid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        return userSnapshot.data() as IUserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  public async getUserWallpapers(): Promise<string[]> {
    try {
      const userData = await this.getUserData();
      if (!userData || !userData.wallpapers) return [];
      
      return userData.wallpapers
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(wallpaper => wallpaper.url);
    } catch (error) {
      console.error('Error getting user wallpapers:', error);
      return [];
    }
  }

  public async removeWallpaper(urlToRemove: string): Promise<void> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');

      const userData = await this.getUserData();
      if (!userData || !userData.wallpapers) return;

      const updatedWallpapers = userData.wallpapers.filter(
        wallpaper => wallpaper.url !== urlToRemove
      );

      await this.querySrv.update('users', uuid, {
        wallpapers: updatedWallpapers
      });

    } catch (error) {
      console.error('Error removing wallpaper:', error);
      throw error;
    }
  }

  public getCurrentuid() {
    const uuid = this.authSrv.getCurrentUserUid();
    return uuid;
  }

  async logIn(email: string, password: string) {
    await this.authSrv.logIn(email, password);
  }

  async logOut() {
    await this.authSrv.logOut();
  }

  public extractTextInParentheses(text: string): string | null {
    const match = text.match(/\((.*?)\)/);
    return match ? match[1] : null;
  }
}