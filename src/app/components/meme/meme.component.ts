import { Meme } from '../../models/meme.interface';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-meme',
  templateUrl: './meme.component.html',
  styleUrls: ['./meme.component.scss'],
})
export class MemeComponent {
  @Input()
  meme: Meme;

  @Input()
  isUpvoted: boolean;

  @Input()
  isAdmin: boolean;

  @Output()
  like = new EventEmitter<void>();

  @Output()
  delete = new EventEmitter<void>();

  @Output()
  approveChange = new EventEmitter();

  changeApproval() {
    const newMeme = { ...this.meme, approved: !this.meme.approved };
    this.approveChange.emit(newMeme);
  }
}
