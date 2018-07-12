import { Component, OnInit } from '@angular/core';
import { CookieService } from '../../lib';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  cookieValue = 'UNKNOWN';
  objectValue = 'UNKNOWN';

  constructor( private cookieService: CookieService ) {}

  ngOnInit(): void {
    this.cookieService.set( 'Test', 'Hello World' );
    this.cookieValue = this.cookieService.get('Test');

    this.cookieService.setJSON('JSON Test', { value: 'test json value' });
    let value = this.cookieService.getJSON('JSON Test');
    this.objectValue = JSON.stringify(value, null, 2);
  }
}
