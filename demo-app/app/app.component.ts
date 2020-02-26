import { Component, OnInit } from '@angular/core';
import { CookieService, CookieModel } from '../../lib';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  cookieValue = 'UNKNOWN';

  constructor( private cookieService: CookieService ) {}

  ngOnInit(): void {
    this.cookieService.set( {name: 'Test', value: 'demo works!'} );
    this.cookieValue = this.cookieService.get('Test');
  }
}
