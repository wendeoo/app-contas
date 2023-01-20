import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  public isSignedIn: boolean = false;
  public resetPasswordSent: boolean = false;
  public errorMessage: string = '';

  constructor(public firebaseAuth: AngularFireAuth, public firebaseFirestore: AngularFirestore) {}

  public async signIn(email: string, password: string) {  
    await this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then(res => {
        this.isSignedIn = true;
        localStorage.setItem('user', res.user?.uid!);        
      }, (err) => {
        switch (err.code) {
          case 'auth/wrong-password':
            this.errorMessage = 'Senha incorreta.';          
          break;
          case 'auth/invalid-email':
            this.errorMessage = 'Email inválido.';
          break;
          case 'auth/user-not-found':
            this.errorMessage = 'Usuário não encontrado.';
          break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Tentativas de login excedidas. Por favor aguarde.';  
          break;
        }
      })
  }

  public async recoveryPassword(email: string) {
    await this.firebaseAuth.sendPasswordResetEmail(email)
    .then(() => {
      this.resetPasswordSent = true;
    }, (err) => {
      switch (err.code) {
        case 'auth/invalid-email':
          this.errorMessage = 'Email inválido.';
        break;
        case 'auth/user-not-found':
          this.errorMessage = 'Usuário não encontrado.';
        break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Tentativas de login excedidas. Por favor aguarde.';  
        break;
        case 'auth/missing-email':
          this.errorMessage = 'Preencha o campo de email.';  
        break;
      } 
    })
  }

  public async signUp(email: string, password: string, name: string) {
    await this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then(async res => {
        this.isSignedIn = true;
        await this.firebaseFirestore.collection('Users').doc(res?.user?.uid).set({
          name
        });
        localStorage.setItem('user', res?.user?.uid!);   
        return res?.user?.uid;
      }, (err) => {
        switch (err.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = 'Email já cadastrado.';
          break;
          case 'auth/invalid-email':
            this.errorMessage = 'Email inválido.';
          break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Tentativas de login excedidas. Por favor aguarde.';  
          break;
        }
      })   
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.firebaseAuth.signOut();    
  }

  public getUserData(): Observable<any> | undefined {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;    
    return this.firebaseFirestore.collection('Users').doc(userUid).valueChanges();
  }

  

  public saveMonthEarnings(year: string, month: string, value: any): void { 
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Users').doc(userUid).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Earnings').doc('Earnings').set(value);
  }

  public getMonthEarnings(year: string, month: string): Observable<any> { 
    let userUid = localStorage.getItem('user');
    return this.firebaseFirestore.collection('Users').doc(userUid!).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Earnings').doc('Earnings').valueChanges();
  }

  public getBills(year: string, month: string): Observable<any> {
    let userUid = localStorage.getItem('user');
    return this.firebaseFirestore.collection('Users').doc(userUid!).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills', (ref) => ref.orderBy('createdAt', 'desc')).snapshotChanges();
  }

  public updateBill(year: string, month: string, billId: string, billData: any): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Users').doc(userUid).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).update(billData);
  }

  public deleteBill(year: string, month: string, billId: string): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Users').doc(userUid).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).delete();
  }

}
