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

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.memes$ = this.firestore.collection<Meme>('memes').valueChanges();
  }
}
