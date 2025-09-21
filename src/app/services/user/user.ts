import { Injectable } from '@angular/core';
import { IUserCreate } from 'src/app/interfaces/user-interface';
import { Auth } from 'src/app/provide/auth/auth';
import { Query } from 'src/app/provide/query/query';


@Injectable({
  providedIn: 'root'
})
export class User {

  constructor(
    private readonly authSrv: Auth,
    private readonly querySrv: Query,
  ) {}

  async create(user: IUserCreate): Promise<void> {
    try {
      const uid = await this.authSrv.register(user.email, user.password);
      await this.querySrv.set("users", uid, {
        uid,
        name: user.name,
        lastName: user.lastName,
      });
   await this.logOut();
    } catch (error) {
      console.log(error);
    }
  }

  async logIn(email: string, password: string) {
    await this.authSrv.logIn(email, password);
  }

  async logOut() {
    await this.authSrv.logOut();
  }




}