import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-translate',
  templateUrl: './toggle-translate.component.html',
  styleUrls: ['./toggle-translate.component.scss'],
  standalone: false,
})
export class ToggleTranslateComponent  implements OnInit {

  @Input() value: boolean = false;
  @Input() left: string = ''
  @Input() rigth: string = ''
  @Output() valueChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {}

  public onChange(event: any) {
    const newValue = event.detail.checked;
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

}