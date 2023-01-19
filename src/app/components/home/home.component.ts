import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, OnInit, Output } from '@angular/core';
import { map } from 'rxjs';

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
  public paidBills: any[] = [];
  public today: any;
  public monthYear: string = '0';
  public isEditingMonth: boolean = false;
  public splitMonth: any;
  public splitYear: any;
  public selectedMonth: any;
  public selectedDate: string = 'Janeiro/2023';
  public isLoading: boolean = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {

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
    
    this.getBills();
  }

  public editMonth(): void {    
    if (!this.isEditingMonth) {
      this.isEditingMonth = true;
      setTimeout(() => {        
        document.getElementById("input-month")?.click();
      }, 100);
    } else {
      if (this.monthYear === '') this.monthYear = `${this.year}-${this.monthNumber}`; 
      console.log(this.monthYear);
           
      this.isEditingMonth = false;
      this.selectedDate = this.formatDate(this.monthYear);
      this.getBills();
    }
  }

  public getBills(): void {
    this.isLoading = true;
    const dateParts = this.monthYear.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      let _sub = this.firebaseService.getBills(year, month).pipe(map((actions) =>
          actions.map((a: any) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      ).subscribe((data) => {
        this.isLoading = false;
        setTimeout(() => {          
          this.checkPaidBills();
        }, 100);
        _sub.unsubscribe();
        this.bills = data;
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

  public createNewBill(): void {
    if (this.selectedDate === '') return;
    this.bills.push({
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

  public valueCalc(operation: 'paid' | 'unpaid'): number {
    if (this.selectedDate !== '') {
      let _total = 0;
      this.bills.forEach((element) => {
        if (operation === 'paid') {
          if (element.isPaid) _total += element.billValue;
        } else {
          if (!element.isPaid) _total += element.billValue;
        }
      });
      _total.toString().replace('.', ',');
      return _total;
    }
    return 0;
  }

  public stopEditing(): void {
    this.bills.forEach((element) => {
      if (element.isEditing) element.isEditing = false;
    })
  }

  public removeBill(index: number): void {
    this.bills.splice(index, 1);
    //enviar dados para o firebase 
  }
}
