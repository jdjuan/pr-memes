import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Meme } from './models/meme.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pr-memes';
  memes$: Observable<Meme[]>;

  likesMap: Record<string, boolean> = {};

  addingMeme = false;

  form = new FormGroup({
    url: new FormControl('', [Validators.required])
  });

  constructor(private firestore: AngularFirestore, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.memes$ = this.firestore
      .collection<Meme>('memes', (ref) => ref.where('approved', '==', true))
      .valueChanges({ idField: 'id' })
      .pipe(first());
  }

  addMeme(url: string) {
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
      console.log(this.form.value.url);
      this.firestore.collection<Meme>('memes').add({
        approved: false,
        url: this.form.value.url,
        likes: 0,
      }).then(() => {
        this.form.reset();
        this.form.markAsPristine();
        this.addingMeme = false;
        this.snackBar.open('Thank you! Your meme will show up in the feed once we approve it.', null, {
          duration: 3000
        });
      }, () => {
        this.form.reset();
        this.form.markAsPristine();
        this.addingMeme = false;
        this.snackBar.open('There\'s been a problem adding your meme. Please trying again later.', null, {
          duration: 3000
        });
      });
    }
  }
}
