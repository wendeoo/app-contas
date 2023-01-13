import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bill-card',
  templateUrl: './bill-card.component.html',
  styleUrls: ['./bill-card.component.scss']
})
export class BillCardComponent implements OnInit {

  @Output() deleteEmitter: EventEmitter<any> = new EventEmitter();

  public today: any;
  public month: any;
  public isEditing: boolean = false;

  @Input() public billData: any = {
    billName: '',
    billValue: 0,
    billDate: 0,
    isPaid: false,
    isEditing: true
  };

  ngOnInit(): void {
    
  }

  public billEdit(): void {
    this.billData.isEditing = true;
  }

  public saveEdit(): void {
    //enviar novos dados para o firebase
    this.billData.isEditing = false;
    this.formatDate();
  }

  public formatDate(): void {
    this.billData.billDate = this.billData.billDate.split('-').reverse().join('/');   
  }

  public deleteBill(): void {
    this.deleteEmitter.emit();
  }
}
