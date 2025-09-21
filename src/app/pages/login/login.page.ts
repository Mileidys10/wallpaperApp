import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { Loading } from 'src/app/core/providers/loading/loading';
import { Translate } from 'src/app/core/providers/translator/translate';
import { User } from 'src/app/services/user/user';









@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  public language = false;


 public email!: FormControl;
  public password!: FormControl;
  public loginForm!: FormGroup;
  constructor( private userSrv: User,
    private readonly router: Router,
      private loadingSrv: Loading,
    private translateSrv: Translate,


) { }

  ngOnInit() {
  this.initForm();
      
  }
 public changeLang(state: boolean) {
    const lang = state ? 'es' : 'en';
    this.translateSrv.useLang(lang);
  }

public async logIn() {
    await this.userSrv.logIn(this.email.value, this.password.value);
    this.router.navigate(['/home']);
  }



  public initForm() {
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }




}