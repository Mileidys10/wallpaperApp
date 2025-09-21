import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './componets/input/input.component';
import { ButtonComponent } from './componets/button/button.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../services/user/user';



const myModules = [ CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule ];
const myComponents = [ InputComponent, ButtonComponent ];
const myProviders = [ User ];
@NgModule({
  declarations: [
    ...myComponents,
   

  ],
providers:[...myProviders],

  imports: [
    ...myModules

  ],

  exports:[...myModules,...myComponents]

})
export class SharedModule { }
