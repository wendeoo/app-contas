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
        localStorage.setItem('email', email);        
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
      localStorage.setItem('email', email);
      this.saveUserInfo(email, res?.user?.uid!);      
      this.createDatabase(res?.user?.uid!, name);
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

  public async saveUserInfo(email: string, db: string) {
    let userUid = localStorage.getItem('user');
    await this.firebaseFirestore.collection('UserInfo').doc(email).set({
      uid: userUid,
      savedDb: db
    });
  }

  public createDatabase(uid: string, name: string) {
    this.firebaseFirestore.collection('Database').doc(uid).collection('Years').doc('2023').collection('Months').doc('01').collection('Bills').doc('default').set({default: 'default'});
    this.firebaseFirestore.collection('Database').doc(uid).set({members: [uid]});
    this.firebaseFirestore.collection('Database').doc(uid).set({owner: name});
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
    localStorage.removeItem('email');
    this.firebaseAuth.signOut();    
  }

  public getUserData(): Observable<any> | undefined {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;    
    return this.firebaseFirestore.collection('Users').doc(userUid).valueChanges();
  }

  public getUserInfo(email: string): Observable<any> | undefined {
    return this.firebaseFirestore.collection('UserInfo').doc(email).valueChanges();
  }

  public getDatabaseOwner(): Observable<any> | undefined {
    return this.firebaseFirestore.collection('Database').valueChanges();
  }

  public getCurrentDatabaseOwner(db: string): Observable<any> | undefined {
    return this.firebaseFirestore.collection('Database').doc(db).valueChanges();
  }

  public updateName(newName: string): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Users').doc(userUid).update({name: newName});
  }

  public getBills(year: string, month: string, docId: string): Observable<any> {
    return this.firebaseFirestore.collection('Database').doc(docId).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills', (ref) => ref.orderBy('createdAt', 'desc')).snapshotChanges();
  }  

  public deleteBill(year: string, month: string, billId: string, docId: string): void {
    let userUid = localStorage.getItem('user');
    if (!userUid) return;
    this.firebaseFirestore.collection('Database').doc(docId).collection('Years').doc(year)
    .collection('Months').doc(month).collection('Bills').doc(billId).delete();
  }

}
