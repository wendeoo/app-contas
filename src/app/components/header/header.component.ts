import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() public weekDay: string = '';
  @Input() public day: number = 0;
  @Input() public month: string = '';
  @Input() public year: number = 0;
  @Input() public theme: any;
  @Input() public isSettings: boolean = false;
  @Output() public settingsEmitter: EventEmitter<any> = new EventEmitter();

  public userName: string = '';
  public loadingData: boolean = false;

  constructor(
    public firebaseService: FirebaseService,
    public router: Router) {}

  public date = new Date();
  public hour = this.date.getHours();
  public greetingMessage: string = '';

  ngOnInit(): void {
    this.hour = this.date.getHours();
    if (this.hour >= 6 && this.hour <= 11)
    this.greetingMessage = 'Bom dia, ';
    else if (this.hour >= 12 && this.hour <= 18)
    this.greetingMessage = 'Boa tarde, ';
    else this.greetingMessage = 'Boa Noite, ';

    if (localStorage.getItem('user')) this.getUserData();
  } 

  public getUserData() {
    this.loadingData = true;
    this.firebaseService.getUserData()?.subscribe((data) => {
      this.userName = data.name;
      this.loadingData = false;
    })
  } 

  public goToSettings(): void {
    this.isSettings = !this.isSettings;
    this.settingsEmitter.emit();
  }
}
