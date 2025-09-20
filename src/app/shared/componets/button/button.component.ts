import { Component, Input, OnInit } from '@angular/core';

type ButtonType = "button" | "reset" | "submit";
type ColorType =  "danger" | "dark" | "light" | "primary" ;

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
    standalone: false

})
export class ButtonComponent  implements OnInit {

@Input() type: ButtonType = 'button';
  @Input() color: ColorType = 'primary';
  @Input() disabled: boolean = false;
  @Input() value: string = '';
  @Input() icon: string = '';

  constructor() { }

  ngOnInit() {}

}
