import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AngularFireModule } from '@angular/fire/compat'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';
import { BillCardComponent } from './components/bill-card/bill-card.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    BillCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAeWO69xyayLcwk3DTldm8jPlMmeVGQxNU",
      authDomain: "app-contas-5f486.firebaseapp.com",
      projectId: "app-contas-5f486",
      storageBucket: "app-contas-5f486.appspot.com",
      messagingSenderId: "368034581475",
      appId: "1:368034581475:web:c35c340c1cabbf4cdfaed6"
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
