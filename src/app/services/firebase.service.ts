import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs';
import { arrayRemove, arrayUnion } from '@angular/fire/firestore';

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
      this.saveUserInfo(email);      
      this.createDatabase(res?.user?.uid!);
      this.addMember(res?.user?.uid!);
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

  public async saveUserInfo(email: string) {
    let userUid = localStorage.getItem('user');
    await this.firebaseFirestore.collection('UserInfo').doc(email).set({
      uid: userUid
    });
  }

  public createDatabase(uid: string) {
    this.firebaseFirestore.collection('Database').doc(uid).collection('Years').doc('2023').collection('Months').doc('01')
    .collection('Bills').doc('default').set({default: 'default'});
    this.firebaseFirestore.collection('Database').doc(uid).set({members: [uid]});
  }

  public addMember(uid: string) {
    let myUid = localStorage.getItem('user');
    this.firebaseFirestore.collection('Database').doc(myUid!).update({
      members: arrayUnion(uid)
    })
  }

  public getInvitedUid(email: string): Observable<any> {
    return this.firebaseFirestore.collection('UserInfo').doc(email).valueChanges();
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

  public updateName(newName: string): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Users').doc(userUid).update({name: newName});
  }

  // public getBills(year: string, month: string): Observable<any> {
  //   let userUid = localStorage.getItem('user');   
  //   return this.firebaseFirestore.collection('Database', (ref) => ref.where(userUid!, 'array-contains', 'members')).doc(userUid!).collection('Years').doc(year)
  //   .collection('Months').doc(month).collection('Bills', (ref) => ref.orderBy('createdAt', 'desc')).snapshotChanges();
  // }

  public getBills(year: string, month: string, docId: string): Observable<any> {
    return this.firebaseFirestore.collection('Database').doc(docId).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills', (ref) => ref.orderBy('createdAt', 'desc')).snapshotChanges();
  }

  public updateBill(year: string, month: string, billId: string, billData: any): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Database').doc(userUid).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).update(billData);
  }

  public deleteBill(year: string, month: string, billId: string): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Database').doc(userUid).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).delete();
  }

}
