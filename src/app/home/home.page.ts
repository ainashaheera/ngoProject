import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private route: Router) {}

  loginPage()
  {
    this.route.navigate (['/login']);
  }

  signupPage()
  {
    this.route.navigate (['/signup']);
  }

}
