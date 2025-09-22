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



    public async UpdateUser(name: string, lastName: string){
    try{
      const uuid = this.getCurrentuid();
      await this.querySrv.update('users', uuid!, {
      name: name,
      lastName: lastName
    });
    return uuid;
    }catch(error){
      const errorMsg = this.extractTextInParentheses((error as any).message) || "Error desconocido";
      throw new Error(errorMsg);
    }
  }

  public getCurrentuid(){
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