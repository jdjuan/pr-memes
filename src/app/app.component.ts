import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pr-memes';
  memes$: Observable<any>;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.memes$ = this.firestore.collection('memes').valueChanges();
  }
}
