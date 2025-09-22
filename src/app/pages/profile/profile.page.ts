import { Component, OnInit } from '@angular/core';
import { Translate } from 'src/app/core/providers/translator/translate';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/services/user/user';
import { Router } from '@angular/router';
import { NativeToast } from 'src/app/core/providers/nativeToast/native-toast';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  currentLang = 'en';
    public name !: FormControl;
  public lastName !: FormControl;
  public updaterForm !: FormGroup;

  constructor(private translateSrv: Translate,private userSrv: User,
    private readonly router: Router, private readonly toast: NativeToast) { 
          this.initForm();

    }
 
private initForm(){
    this.name = new FormControl('', [Validators.required]);
    this.lastName = new FormControl('', [Validators.required]);
    this.updaterForm = new FormGroup({
      name: this.name,
      lastName: this.lastName
    });
  }


public async onSubmit(){
    try{
      await this.userSrv.UpdateUser(this.name.value, this.lastName.value);
      this.router.navigate(['/home']);
      this.toast.show("Updater successful");
    }catch(error){
      this.toast.show(((error as any).message) || "Update failed");
    } 
  }

  public goToHome(){
    this.router.navigate(['/home']);
  }


  ngOnInit() {

        this.currentLang = this.translateSrv.getCurrentLang();

  }
 setLang(lang: string) {
    this.translateSrv.useLang(lang);
    this.currentLang = lang;
  }
}
