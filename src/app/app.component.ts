import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Meme } from './models/meme.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pr-memes';
  memes$: Observable<Meme[]>;

  likesMap: Record<string, boolean> = {};

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.memes$ = this.firestore
      .collection<Meme>('memes', (ref) => ref.where('approved', '==', true))
      .valueChanges({ idField: 'id' })
      .pipe(first());
  }

  addMeme(url: string) {
    this.firestore.collection<Meme>('memes').add({
      approved: false,
      url,
      likes: 0,
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
}
