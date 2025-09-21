import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Loading } from 'src/app/core/providers/loading/loading';
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
  public name!: FormControl;
  public lastName!: FormControl;
  public email!: FormControl;
  public password!: FormControl;
  public registerForm!: FormGroup;

 /*registerForm!: FormGroup;
    get name() { return this.registerForm.get('name') as FormControl; }
  get lastName() { return this.registerForm.get('lastName') as FormControl; }
  get email() { return this.registerForm.get('email') as FormControl; }
  get password() { return this.registerForm.get('password') as FormControl; }
*/
  constructor( private router: Router,
    private alertCtrl: AlertController,
    private authService: Auth,
    private database: Database,
        private loadingSrv: Loading,
            private userSrv: User,





) { }




  ngOnInit() {

    this.initForm();

  }
 public async doRegister() {
    await this.loadingSrv.present({
      msg: 'Please wait...'
    });
    await this.userSrv.create(this.registerForm.value);
    this.registerForm.reset();
    await this.loadingSrv.dimiss();
    this.router.navigate(['/']);
  }

  public initForm() {
    this.name = new FormControl('', [Validators.required]);
    this.lastName = new FormControl('', [Validators.required]);
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    this.registerForm = new FormGroup({
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    });
  }
   
  /*  const { name, lastName, email, password } = this.registerForm.value;

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

  /*private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }*/
}
