import { Injectable } from '@angular/core';
import { Auth as AuthFirebase, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(
    private readonly afb: AuthFirebase,
  ) {}

  async register(email: string, password: string) {
    try {
      const resp = await createUserWithEmailAndPassword(
        this.afb,
        email,
        password,
      );
      return resp.user.uid;
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  async logIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(
        this.afb,
    email,
        password,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async logOut() {
    try {
      await signOut(this.afb);
    } catch (error) {
      console.log(error);
    }
  }

getCurrentUserUid(): string | null {
  return this.afb.currentUser ? this.afb.currentUser.uid : null;
}

  
}