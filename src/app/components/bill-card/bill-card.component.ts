import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bill-card',
  templateUrl: './bill-card.component.html',
  styleUrls: ['./bill-card.component.scss']
})
export class BillCardComponent implements OnInit {

  @Input() public today: any;
  @Output() public deleteEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public billPaidEmitter: EventEmitter<any> = new EventEmitter();

  public month: any;
  public isEditing: boolean = false;
  public lockIcon: string = 'lock_open';

  @Input() public billData: any = {
    billName: '',
    billValue: 0,
    billDate: 0,
    billPaidDate: 0,
    isPaid: false,
    isLocked: false,
    isEditing: true
  };

  ngOnInit(): void {
    
  }

  public billLockToggle(): void {
    if (this.lockIcon === 'lock') {
    this.lockIcon = 'lock_open';
    this.billData.isLocked = false; 
    //enviar dados para o firebase
    } else {
      this.lockIcon = 'lock';
      this.billData.isLocked = true; 
      //enviar dados para o firebase
    }
  }

  public billPaid(): void {
    this.billData.isPaid = !this.billData.isPaid;
    this.billPaidEmitter.emit();

    //enviar dados para o firebase
  }

  public billEdit(): void {
    this.billData.isEditing = true;
  }

  public saveEdit(): void {
    if (this.billData.billValue <= 0) {
      this.deleteBill();
    } else {     

      if (this.billData.billName === '') {
        this.billData.billName = '(nova conta)'
      }

      this.billData.isEditing = false;
      this.formatDate();

      //enviar dados para o firebase
    }
  }

  public formatDate(): void {
    this.billData.billDate = this.billData.billDate.split('-').reverse().join('/');   
    this.billData.billPaidDate = this.billData.billPaidDate.split('-').reverse().join('/');   
  }

  public deleteBill(): void {
    this.deleteEmitter.emit();
  }
}
