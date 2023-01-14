import { Component, OnInit, Output } from '@angular/core';

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
  public year: number = 0;
  public bills: any[] = [];
  public paidBills: any[] = [];
  public today: any;
  public monthYear: string = '0';
  public isEditingMonth: boolean = false;
  public splitMonth: any;
  public splitYear: any;
  public selectedMonth: any;
  public concatMonthYear: string = '';

  ngOnInit(): void {

    let _now = new Date().getTime();
    let _date = new Date(_now);
    let _month = _date.getMonth()+1;
    if (_month <= 9) this.month = '0' + _month;
    this.today = _date.getDate()+'/'+this.month+'/'+_date.getFullYear();
    this.concatMonthYear = this.today;

    this.bills.push({
      billName: 'Conta de Energia',
      billValue: 160.65,
      billDate: '12/01/2023',
      billPaidDate: this.today,
      isPaid: false,
      isLocked: false,
      isEditing: false
    });

    this.bills.push({
      billName: 'Condomínio',
      billValue: 250.82,
      billDate: '25/01/2023',
      billPaidDate: this.today,
      isPaid: false,
      isLocked: false,
      isEditing: false
    });

    switch (this.date.getDay()) {
      case 0: this.weekDay = 'Domingo'; break;
      case 1: this.weekDay = 'Segunda-feira'; break;
      case 2: this.weekDay = 'Terça-feira'; break;
      case 3: this.weekDay = 'Quarta-feira'; break;
      case 4: this.weekDay = 'Quinta-feira'; break;
      case 5: this.weekDay = 'Sexta-feira'; break;
      case 6: this.weekDay = 'Sábado'; break;
    }

    this.day = this.date.getDate();

    switch (this.date.getMonth()) {
      case 0: this.month = 'Janeiro'; break;
      case 1: this.month = 'Fevereiro'; break;
      case 2: this.month = 'Março'; break;
      case 3: this.month = 'Abril'; break;
      case 4: this.month = 'Maio'; break;
      case 5: this.month = 'Junho'; break;
      case 6: this.month = 'Julho'; break;
      case 7: this.month = 'Agosto'; break;
      case 8: this.month = 'Setembro'; break;
      case 9: this.month = 'Outubro'; break;
      case 10: this.month = 'Novembro'; break;
      case 11: this.month = 'Dezembro'; break;
    }

    this.year = this.date.getFullYear();    
  }

  public editMonth(): void {
    if (!this.isEditingMonth) {
      this.isEditingMonth = true;
    } else {
      
      this.splitMonth = this.monthYear.split('-').splice(1, 3);
      this.splitYear = this.monthYear.split('-').reverse().splice(1, 1);

      if (this.splitMonth[0] === '01') this.selectedMonth = 'Janeiro';
      if (this.splitMonth[0] === '02') this.selectedMonth = 'Fevereiro';
      if (this.splitMonth[0] === '03') this.selectedMonth = 'Março';
      if (this.splitMonth[0] === '04') this.selectedMonth = 'Abril';
      if (this.splitMonth[0] === '05') this.selectedMonth = 'Maio';
      if (this.splitMonth[0] === '06') this.selectedMonth = 'Junho';
      if (this.splitMonth[0] === '07') this.selectedMonth = 'Julho';
      if (this.splitMonth[0] === '08') this.selectedMonth = 'Agosto';
      if (this.splitMonth[0] === '09') this.selectedMonth = 'Setembro';
      if (this.splitMonth[0] === '10') this.selectedMonth = 'Outubro';
      if (this.splitMonth[0] === '11') this.selectedMonth = 'Novembro';
      if (this.splitMonth[0] === '12') this.selectedMonth = 'Dezembro';
      
      this.concatMonthYear = this.selectedMonth + '/' + this.splitYear;

      //-
      this.isEditingMonth = false;
      //solicitar dados ao firebase      
    }
  }

  public createNewBill(): void {
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
