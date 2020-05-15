import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { AuthService } from './core/auth.service';
import { Meme } from './models/meme.interface';
import { AppUser } from './models/user.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pr-memes';
  memes$: Observable<Meme[]>;
  urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  likesMap: Record<string, boolean> = {};
  addingMeme = false;
  form = new FormGroup({
    url: new FormControl('', [
      Validators.required,
      Validators.pattern(this.urlReg),
    ]),
    tags: new FormControl([]),
  });
  user$: Observable<AppUser>;
  adminView = new BehaviorSubject(false);
  TAGS = ['Pull Request', 'Deployment', 'Bug'];

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    this.user$ = this.auth.user$;
  }

  ngOnInit() {
    this.memes$ = this.adminView.pipe(
      switchMap((viewOn) => {
        if (viewOn) {
          return this.firestore
            .collection<Meme>('memes')
            .valueChanges({ idField: 'id' })
            .pipe(first());
        } else {
          return this.firestore
            .collection<Meme>('memes', (ref) =>
              ref.orderBy('likes', 'desc').where('approved', '==', true)
            )
            .valueChanges({ idField: 'id' })
            .pipe(first());
        }
      })
    );
  }

  deleteMeme(meme: Meme) {
    this.firestore
      .doc(`memes/${meme.id}`)
      .delete()
      .then(() => {
        this.snackBar.open(
          'Meme successfully deleted',
          null,
          {
            duration: 7000,
          }
        );
      });
  }

  likeMeme(meme: Meme) {
    const likes = (meme.likes || 0) + 1;
    this.firestore
      .doc(`memes/${meme.id}`)
      .set({ likes }, { merge: true })
      .then(() => {
        this.likesMap[meme.id] = true;
        this.updateItemInLS(meme.id);
        meme.likes++;
      });
  }

  getLikesMap(): Record<string, boolean> {
    const likesMap = JSON.parse(localStorage.getItem('likesMap'));
    return likesMap || {};
  }

  updateItemInLS(id: string) {
    const currentMap = this.getLikesMap();
    currentMap[id] = true;
    localStorage.setItem('likesMap', JSON.stringify(currentMap));
  }

  onSubmit() {
    if (this.form.valid) {
      this.addingMeme = true;
      this.firestore
        .collection<Meme>('memes')
        .add({
          approved: false,
          url: this.form.value.url,
          likes: 0,
          tags: this.form.value.tags,
        })
        .then(
          () => {
            this.form.reset();
            this.form.markAsPristine();
            this.form.markAsUntouched();
            this.form.controls.url.setErrors(null);
            this.addingMeme = false;
            this.snackBar.open(
              'Thank you! Your meme will show up in the feed once we approve it.',
              null,
              {
                duration: 7000,
              }
            );
          },
          () => {
            this.form.reset();
            this.form.markAsPristine();
            this.addingMeme = false;
            this.snackBar.open(
              'There has been a problem adding your meme. Please trying again later.',
              null,
              {
                duration: 7000,
              }
            );
          }
        );
    }
  }

  changeApproval(meme: Meme) {
    this.firestore.collection('memes').doc(meme.id).set(meme, { merge: true });
  }
}
