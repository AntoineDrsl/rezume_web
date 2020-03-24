import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../shared/company.service';
import { Router } from '@angular/router';

import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {

  companyDetails;
  favorites;
  serverErrorMessage: boolean;
  valid = false;

  options: AnimationOptions = {
    path: '/assets/lottie/data.json',
    loop: true,
    autoplay: true
  };

  animationCreated(animationItem: AnimationItem): void {
    // console.log(animationItem);
    animationItem.setSpeed(0.5);
  }

  constructor(private companyService: CompanyService, private router: Router) { }

  ngOnInit() {
    this.companyService.getCompanyProfile().subscribe(
      res => {
        this.companyDetails = res['company'];
        this.valid = true;
      },
      err => {
        this.serverErrorMessage = true;
      }
    );
    this.companyService.getAllFavorites().subscribe(
      res => {
        this.favorites = res['favorites'];
      },
      err => { 
        this.serverErrorMessage = true;
      }
    );
  }

  onLogout() {
    this.companyService.deleteToken();
    this.router.navigate(['/login']);
  }



}
