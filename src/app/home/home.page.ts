import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  @Input() data;
  cuteLoadingMessage = '';

  loadingMessages = [
    'Doing all sorts of cool AI stuff.',
    'Our security elves are running arround collecting data.',
    'Detecting malware... with gusto!',
    'Intentionally making you wait longer, because we can.',
    'Only {ERROR: STACK OVERFLOW} more seconds.',
    'Dang, if only your phone was faster, you wouldn\'t be witing so long.',
    'Using AI to make you wait longer.',
    'Executing rm /rf',
    'Disrupting your warp fields with an inverse graviton burst.',
    'Downloading more ram.',
    'Wouldn\'t it be funny if I was actually malware.'
  ];
  constructor() {}

  ngOnInit(): void {
    this.setRandomLoadingMessage();

    const interval = setInterval(async () => {
      const x = document.getElementById('cuteLoadingMessage');
      if(x){
        x.style.opacity = '0';
        await this.delay(500);
        this.setRandomLoadingMessage();
        x.style.opacity = '1';
      }

    }, 8000);

  }
delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

  setRandomLoadingMessage(){
    let randIndex = Math.floor(Math.random()* this.loadingMessages.length);
    if(this.loadingMessages[randIndex] === this.cuteLoadingMessage){
      randIndex = (randIndex + 1) % this.loadingMessages.length;
    }
    this.cuteLoadingMessage = this.loadingMessages[randIndex];
  }

}
