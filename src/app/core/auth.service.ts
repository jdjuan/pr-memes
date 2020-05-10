import { AngularFirestore } from '@angular/fire/firestore';
import { AppUser } from './../models/user.interface';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { auth, User } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<AppUser>;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((fbUser) => {
        if (fbUser) {
          return this.db
            .collection('users')
            .doc<AppUser>(fbUser.uid)
            .valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  googleLogin() {
    this.afAuth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then((credential) => this.updateUser(credential.user));
  }

  logOut() {
    this.afAuth.signOut();
  }

  private updateUser(user: User) {
    this.db
      .collection('users')
      .doc<AppUser>(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        rol: {
          user: true,
          admin: this.isAdmin(user.email),
        },
      });
  }

  private isAdmin(email: string) {
    return Boolean(
      email === 'nicolas@pappcorn.com' ||
        'ce.roso398@gmail.com' ||
        'david.juanherrera@gmail.com'
    );
  }
}
