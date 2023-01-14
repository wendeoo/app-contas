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

  ngOnInit(): void {

    let _now = new Date().getTime();
    let _date = new Date(_now);
    let _month = _date.getMonth()+1;
    if (_month <= 9) this.month = '0' + _month;
    this.today = _date.getDate()+'/'+this.month+'/'+_date.getFullYear();

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
