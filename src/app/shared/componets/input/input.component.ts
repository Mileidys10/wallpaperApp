import { Component,   Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

type InputType = "date" | "datetime-local" | "email" | "month" | "number" | "password" | "search" | "tel" | "text" | "time" | "url" | "week";


@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
    standalone: false

})


export class InputComponent  implements OnInit {
@Input() type: InputType = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control: FormControl = new FormControl();









constructor() { }


  ngOnInit() {}

 public onInputChange(event: any) {
    this.control.setValue(event.target.value);
  }








}
