import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Auth } from 'src/app/provide/auth/auth';
import { Database } from 'src/app/services/database';
import { User } from 'src/app/services/user/user';
import { v4 as uuidv4 } from 'uuid';





@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})






export class RegisterPage implements OnInit {

 registerForm!: FormGroup;
    get name() { return this.registerForm.get('name') as FormControl; }
  get lastName() { return this.registerForm.get('lastName') as FormControl; }
  get email() { return this.registerForm.get('email') as FormControl; }
  get password() { return this.registerForm.get('password') as FormControl; }

  constructor( private router: Router,
    private alertCtrl: AlertController,
    private authService: Auth,
    private database: Database

) { }




  ngOnInit() {


 this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });







  }
async doRegister() {
   if (this.registerForm.invalid) {
      this.showAlert('Error', 'Fill all the fields');
      return;
    }
   
    const { name, lastName, email, password } = this.registerForm.value;

     try {
      // Crea usuario en Firebase Auth
      const uid = await this.authService.register(email, password);

      //  Crea documento en Firestore
      await this.database.addDocument({ uid, name, lastName, email }, 'users');

      this.showAlert('Success', 'User registered successfully ✅');
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.showAlert('Registration failed', err.message || 'Error creating user');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}