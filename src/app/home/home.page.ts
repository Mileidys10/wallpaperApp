import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { User } from '../services/user/user';
import { Router } from '@angular/router';
import { File } from 'src/app/provide/provide/file';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  public image = {};

  constructor(
    private readonly fileSrv: File,
    private userSrv: User,
    private readonly router: Router,
  ) { }

  ngOnInit() {
  }

  public async pickImage() {
    this.image = await this.fileSrv.pickImage();
  }

  public async logOut() {
    await this.userSrv.logOut()
    this.router.navigate(['/']);
  }

}