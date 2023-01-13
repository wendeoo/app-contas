import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public isLoginScreen: boolean = true;
  public formRegister!: FormGroup;
  public formLogin!: FormGroup;
  public hasError: boolean = false;
  public errorMessage: string = '';
  public isLoading: boolean = false;
  public backArrows: string = '  <<';
  public forwardArrows: string = '>>  ';

  constructor(
    public firebaseService: FirebaseService,
    public router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    if (localStorage.getItem('user') !== null) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['login']);
    }

    this.formRegister = this.formBuilder.group({
      nameRegister: ['', Validators.compose([
        Validators.required,
        Validators.minLength(3)
      ])],
      emailRegister: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      ])],
      passwordRegister: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])]
    });

    this.formLogin = this.formBuilder.group({
      emailLogin: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      ])],
      passwordLogin: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])]
    });
  }

  public loginRegister(): void {
    this.hasError = false;
    this.isLoginScreen = !this.isLoginScreen;
  }

  public async onLogin(email: string, password: string) {
    this.isLoading = true;
    if (this.formLogin.valid)
    {
      await this.firebaseService.signIn(email, password);
      if (this.firebaseService.isSignedIn) {
        this.isLoading = false;
        this.router.navigate(['home']);
       } else {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = this.firebaseService.errorMessage;  
      } 
    } else {
      this.isLoading = false;
      this.hasError = true;  
      this.errorMessage = 'Preencha os dados corretamente!';
    }
  }

  public async onRegister(name: string, email: string, password: string) {
    this.isLoading = true;
    if (this.formRegister.valid)
    {
      await this.firebaseService.signUp(email, password, name);
      if (this.firebaseService.isSignedIn) {
        this.isLoading = false;
        this.router.navigate(['home']); 
      } else {
        this.isLoading = false;
      this.hasError = true;  
      this.errorMessage = this.firebaseService.errorMessage;  
      } 
    } else {
      this.isLoading = false;
      this.hasError = true;  
      this.errorMessage = 'Preencha os dados corretamente!';  
    }
  }
}

