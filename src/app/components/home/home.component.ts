import { DatabaseMembers } from './../../interfaces/database-members';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, OnInit, Output } from '@angular/core';
import { map } from 'rxjs';
import { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {    

  public date = new Date();
  public weekDay: string = '';
  public day: number = 0;
  public month: string = '';
  public monthNumber: string = '';
  public year: number = 0;
  public bills: any[] = [];
  public allBills: any[] = [];
  public paidBills: any[] = [];
  public today: any;
  public monthYear: string = '0';
  public isEditingMonth: boolean = false;
  public splitMonth: any;
  public splitYear: any;
  public selectedMonth: any;
  public selectedDate: string = 'Janeiro/2023';
  public isLoading: boolean = false;
  public filterOptions: number = 0;
  public filterName: string = 'Todas';
  public isEditingEarnings: boolean = false;
  public monthEarnings: number = 0;
  public isSettings: boolean = false;
  public userName: string = '';
  public newName: string = '';
  public isEditingName: boolean = false;
  public theme: string = '';
  public isEmailRegistered: boolean = false;
  public inviteEmail: string = '';
  public inviteUid: string = ';'
  public inviteErrorMessage: string = '';
  public myDBs: string[] = [];
  public selectedDatabase: any;

  constructor(
    private firebaseService: FirebaseService,
    private firebaseFirestore: AngularFirestore,
    private router: Router,
    private firebaseAuth: AngularFireAuth
    ) {}

  ngOnInit(): void {

    let _theme = localStorage.getItem('selectedTheme');
    if (_theme) this.theme = _theme;
    else this.theme = 'default';
       
    this.init();
    this.getBills(); 
    this.getUserData();
  }

  public editMonth(): void {    
    if (!this.isEditingMonth) {
      this.isEditingMonth = true;
      setTimeout(() => {        
        document.getElementById("input-month")?.click();
      }, 100);
    } else {
      if (this.monthYear === '') this.monthYear = `${this.year}-${this.monthNumber}`;           
      this.isEditingMonth = false;
      this.selectedDate = this.formatDate(this.monthYear);
      this.monthEarnings = 0;
      this.getBills();
    }
  }

  public init(): void {

    let _now = new Date().getTime();
    let _date = new Date(_now);
    let _month = _date.getMonth()+1;
    if (_month <= 9) this.month = '0' + _month;
    this.today = _date.getDate()+'/'+this.month+'/'+_date.getFullYear();   
    this.year = this.date.getFullYear();     
    this.monthYear = `${this.year}-${this.month}`;
    this.monthNumber = this.month;
    
    const weekNames = ['Domingo', 'Segunda-feira', 'Terça-feira',
    'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    this.weekDay = weekNames[this.date.getDay()];

    this.day = this.date.getDate();
       
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.month = monthNames[this.date.getMonth()]; 
  
    this.getMyDatabases();
  }

  public getMyDatabases(): void {
    let searchedValue = localStorage.getItem('user');
    let idDatabase: string[] = [];
    this.selectedDatabase = searchedValue;
    this.firebaseFirestore.collection('Database', ref => ref.where('members', 'array-contains', searchedValue)).get().subscribe((res: any) => {
        res.docs.forEach((document: { id: string; }) => {            
            idDatabase.push(document.id);
            this.myDBs = idDatabase;      
        });
    });    
  }

  public changeMyDatabase(db: string): void {
    this.selectedDatabase = db;
    this.getBills();
  }

  public getUserData() {
    this.firebaseService.getUserData()?.subscribe((data) => {
      this.userName = data.name;
    })
  }

  public getBills(): void {
    this.isLoading = false;
    const dateParts = this.monthYear.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      let userUid = localStorage.getItem('user');
      let _sub = this.firebaseService.getBills(year, month, this.selectedDatabase).pipe(map((actions) =>
          actions.map((a: any) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      ).subscribe((data) => {
        this.isLoading = false;        
        if (data) {
          setTimeout(() => {        
            this.checkPaidBills();
          }, 100);
          _sub.unsubscribe();
          this.bills = data;
          this.allBills = data;
          this.filterOptions = 0;
          this.filterName = 'Todas';
        }
      })
  }

  public formatDate(date: string): string {
    const dateParts = date.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthName = monthNames[parseInt(month) - 1];
    if (month !== undefined) {
      return `${monthName}/${year}`;
    } else return ``;
  }

  public filterBills(): void {
    if (this.filterOptions < 3) this.filterOptions++; else this.filterOptions = 0;
    this.bills = this.allBills;
    switch (this.filterOptions) {
      case 0:
        this.filterName = 'Todas';
      break;
      case 1:        
        this.bills = this.bills.filter((element) => element.isPaid);
        this.filterName = 'Contas Pagas';
      break;
      case 2:
        this.bills = this.bills.filter((element) => !element.isPaid);
        this.filterName = 'Contas em Aberto';
      break;
      case 3:
        this.bills = this.bills.filter((element) => element.isExpired && !element.isPaid);
        this.filterName = 'Contas em Atraso';
      break;
    }
  }

  public createNewBill(): void {
    if (this.selectedDate === '') return;
    this.bills.unshift({
      billName: '',
      billValue: '',
      billDate: this.today,
      billPaidDate: this.today,
      isPaid: false,
      isLocked: false,
      isEditing: true
    });
  }

  public checkPaidBills(): void {
    this.paidBills = this.bills.filter((element) => element.isPaid === true);
  }

  public valueCalc(operation: 'paid' | 'unpaid'): string {
    if (this.selectedDate !== '') {
      let _total = 0;
      this.allBills.forEach((element) => {
        if (operation === 'paid') {
          if (element.isPaid && !element.isEditing) _total += element.billValue;
        } else {
          if (!element.isPaid && !element.isEditing) _total += element.billValue;
        }
      });
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      });
      return formatter.format(_total);
    }
    return 'R$ 0,00';
  }

  public async checkEmailRegistration(email: string) {
    await this.firebaseAuth.fetchSignInMethodsForEmail(email).then((res) => {
      if (res.length > 0) {
      this.isEmailRegistered = true;
      this.firebaseService.getInvitedUid(email).subscribe((data) => {
        this.firebaseService.addMember(data.uid); 
        this.inviteEmail = '';
      })}
      else  this.inviteErrorMessage = 'Email não encontrado.';
    }, (err) => {
      if ((err.code) === 'auth/invalid-email')      
      this.inviteErrorMessage = 'Email inválido.';
    });      
  }

  public stopEditing(): void {
    this.bills.forEach((element) => {
      if (element.isEditing) element.isEditing = false;
    });
  }

  public removeBill(index: number): void {
    this.bills.splice(index, 1);
  }

  public goToSettings(): void {
    this.isSettings = !this.isSettings;
  }

  public saveName(): void {
    this.isEditingName = false;
    if (this.newName) this.firebaseService.updateName(this.newName);
  }

  public getValue(val: string): void {
    this.theme = val;    
    localStorage.setItem('selectedTheme', val);
  }

  public logout(): void {
    this.firebaseService.isSignedIn = false;
    this.firebaseService.logout();    
    this.router.navigate(['login']);
  }
}
