import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './componets/input/input.component';
import { ButtonComponent } from './componets/button/button.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';




@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
   

  ],
providers:[],

  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,

  ],

  exports:[InputComponent,ButtonComponent]

})
export class SharedModule { }
