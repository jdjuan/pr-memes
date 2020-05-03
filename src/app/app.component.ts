import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
      .valueChanges({ idField: 'id' });
  }

  addMeme(url: string) {
    this.firestore.collection<Meme>('memes').add({
      approved: false,
      url,
      likes: 0,
    });
  }

  likeMeme(id: string, currentLikes: number = 0) {
    const likes = currentLikes + 1;
    this.firestore
      .doc(`memes/${id}`)
      .set({ likes }, { merge: true })
      .then(() => {
        this.likesMap[id] = true;
        this.updateItemInLS(id);
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
