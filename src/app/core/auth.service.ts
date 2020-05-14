import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { AppUser } from './../models/user.interface';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { auth, User } from 'firebase/app';

const matSnackbarOptions: MatSnackBarConfig = {
  duration: 5000,
  verticalPosition: 'top',
};
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<AppUser>;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private snackbar: MatSnackBar
  ) {
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
      .then((credential) => {
        this.snackbar.open(`🎉 You are logged in`, 'OK', matSnackbarOptions);
        this.updateUser(credential.user);
      })
      .catch((error) =>
        this.snackbar.open(
          `Something went wrong: ${error}`,
          'OK',
          matSnackbarOptions
        )
      );
  }

  logOut() {
    this.afAuth
      .signOut()
      .then(() =>
        this.snackbar.open('👋 You are logged out', 'OK', matSnackbarOptions)
      )
      .catch((error) =>
        this.snackbar.open(
          `Something went wrong: ${error}`,
          'OK',
          matSnackbarOptions
        )
      );
  }

  private updateUser(user: User) {
    this.db
      .collection('users')
      .doc<AppUser>(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: {
          user: true,
          admin: this.isAdmin(user.email),
        },
      });
  }

  private isAdmin(email: string) {
    const admins = [
      'nicolas@pappcorn.com',
      'ce.roso398@gmail.com',
      'david.juanherrera@gmail.com',
    ];
    return admins.indexOf(email) !== -1;
  }
}
