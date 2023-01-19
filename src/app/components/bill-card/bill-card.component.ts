import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { BillData } from 'src/app/interfaces/bill-data';

@Component({
  selector: 'app-bill-card',
  templateUrl: './bill-card.component.html',
  styleUrls: ['./bill-card.component.scss']
})
export class BillCardComponent implements OnInit {

  @Input() public today: any;
  @Input() public selectedPeriod: any;
  @Output() public deleteEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public billPaidEmitter: EventEmitter<any> = new EventEmitter();

  public month: any;
  public isEditing: boolean = false;
  public lockIcon: string = 'lock_open';

  constructor(private firebaseService: FirebaseService) {}

  @Input() public billData: BillData = {
    billName: '',
    billValue: 0,
    billDate: '',
    billPaidDate: '',
    isPaid: false,
    isLocked: false,
    isEditing: true,
    isSaved: false,
    id: ''
  }

  ngOnInit(): void {
    if (this.billData.isLocked)
    this.lockIcon = 'lock';
    else this.lockIcon === 'lock_open';
  }

  public billLockToggle(): void {
    if (this.lockIcon === 'lock') {
    this.lockIcon = 'lock_open';
    this.billData.isLocked = false; 
    const dateParts = this.selectedPeriod.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    this.firebaseService.updateBill(year, month, this.billData.id, this.billData);
    } else {
      this.lockIcon = 'lock';
      this.billData.isLocked = true; 
      const dateParts = this.selectedPeriod.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      this.firebaseService.updateBill(year, month, this.billData.id, this.billData);
    }
  }

  public billPaid(): void {
    this.billData.isPaid = !this.billData.isPaid;
    this.billPaidEmitter.emit();
    const dateParts = this.selectedPeriod.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    this.firebaseService.updateBill(year, month, this.billData.id, this.billData);
  }

  public billEdit(): void {
    this.billData.isEditing = true;
  }

  public saveEdit(billId: string): void {   
    if (this.billData.billValue > 0) {   

      if (this.billData.billName === '') {
        this.billData.billName = '(nova conta)'
      }

      this.billData.isEditing = false;
      this.formatDate();
      const dateParts = this.selectedPeriod.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      if (this.billData.isSaved && this.billData.id) this.firebaseService.updateBill(year, month, billId, this.billData);
      else {
        this.billData.isSaved = true;
        this.firebaseService.createBill(year, month, this.billData);
        setTimeout(() => {
          location.reload();
        }, 1000);        
      }
    }    
  }

  public formatDate(): void {
    this.billData.billDate = this.billData.billDate.split('-').reverse().join('/');   
    this.billData.billPaidDate = this.billData.billPaidDate.split('-').reverse().join('/');   
  }

  public deleteBill(): void {
    if (this.billData.isLocked) return;
    this.deleteEmitter.emit();
    const dateParts = this.selectedPeriod.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    this.firebaseService.deleteBill(year, month, this.billData.id);    
  }
}
