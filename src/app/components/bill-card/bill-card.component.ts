import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { BillData } from 'src/app/interfaces/bill-data';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-bill-card',
  templateUrl: './bill-card.component.html',
  styleUrls: ['./bill-card.component.scss']
})
export class BillCardComponent implements OnInit {

  @Input() public today: any;
  @Input() public selectedPeriod: any;
  @Input() public selectedDb: any;
  @Input() public paidBy: string = '';
  @Output() public deleteEmitter: EventEmitter<any> = new EventEmitter();
  @Output() public billPaidEmitter: EventEmitter<any> = new EventEmitter();

  public month: any;
  public isEditing: boolean = false;
  public lockIcon: string = 'lock_open';

  constructor(private firebaseService: FirebaseService, private firebaseFirestore: AngularFirestore) {}

  @Input() public billData: BillData = {
    billName: '',
    billValue: 0,
    billDate: '',
    billPaidDate: '',
    isPaid: false,
    isEditing: true,
    isSaved: false,
    isExpired: false,
    createdAt: 0,
    id: '',
    paidBy: ''
  }

  ngOnInit(): void {
    this.compareDates();  
    this.formattedBillValue;
  }

  get formattedBillValue(): string {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
    return formatter.format(this.billData.billValue);
  }

  public billPaid(): void {  
    this.billData.isPaid = !this.billData.isPaid;
    if (this.billData.isPaid) this.billData.paidBy = this.paidBy;
    else this.billData.paidBy = '';
    this.billPaidEmitter.emit();
    const dateParts = this.selectedPeriod.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    this.billData.billPaidDate = this.today;
    this.updateBill(year, month, this.billData.id, this.billData);
  }

  public billEdit(): void {
    this.billData.isEditing = true;
  }

  public async saveEdit(billId: string) {   
    if (this.billData.billValue > 0) {

      if (this.billData.billName === '') {
        this.billData.billName = '(nova conta)'
      }

      this.billData.isEditing = false;
      this.formatDate();
      const dateParts = this.selectedPeriod.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      
      if (this.billData.isSaved && this.billData.id) {
        this.updateBill(year, month, billId, this.billData);
        this.compareDates();
      } else {
        this.billData.isSaved = true;
        this.billData.createdAt = new Date().getTime();        
       
        let userUid = localStorage.getItem('user');
        if (!userUid) return;
        await this.firebaseFirestore.collection('Database').doc(this.selectedDb).collection('Years').doc(year)
        .collection('Months').doc(month).collection('Bills').add(this.billData).then(async data => {
          this.billData.id = data.id;  
        });                
        this.compareDates();
      }
    }    
  }

  public updateBill(year: string, month: string, billId: string, billData: any): void {
    this.firebaseFirestore.collection('Database').doc(this.selectedDb).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).update(billData);
  }

  public compareDates(): void {
    var _billDate = this.billData.billDate;
    var _billDateParts = _billDate.split("/");
    _billDate = _billDateParts[1] + "/" + _billDateParts[0] + "/" + _billDateParts[2];
    var _billDateTime = new Date(_billDate);
    let _now = new Date().getTime();

    var _billDatePaid = this.billData.billPaidDate;
    var _billDatePaidParts = _billDatePaid.split("/");
    var _billDatePaidDay = _billDatePaidParts[1];

    if (parseInt(_billDatePaidDay) <= 9) {
      _billDatePaidDay = '0' + _billDatePaidDay;
    }

    _billDatePaid = _billDatePaidDay + "/" + _billDatePaidParts[0] + "/" + _billDatePaidParts[2];    

    if (_billDateTime.getTime() < _now)
    this.billData.isExpired = true;
    else this.billData.isExpired = false; 
    
  }

  public formatDate(): void {
    this.billData.billDate = this.billData.billDate.split('-').reverse().join('/');   
    this.billData.billPaidDate = this.billData.billPaidDate.split('-').reverse().join('/');     
  }

  public deleteBill(): void {
    this.deleteEmitter.emit();
    const dateParts = this.selectedPeriod.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    this.firebaseService.deleteBill(year, month, this.billData.id, this.selectedDb);    
  }
}
