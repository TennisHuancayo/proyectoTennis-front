import {Component, HostListener, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button' ;
  @Input() disabled: boolean = false ;
  @Input() link?:  string;

  constructor(private router: Router) { }

  @HostListener('click', ['$event'])



  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.link) {
      this.router.navigate([this.link]);
    }
  }
}
