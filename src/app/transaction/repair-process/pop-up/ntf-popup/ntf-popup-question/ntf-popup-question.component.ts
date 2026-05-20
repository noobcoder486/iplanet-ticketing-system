import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ntf-popup-question',
  templateUrl: './ntf-popup-question.component.html',
  styleUrls: ['./ntf-popup-question.component.sass']
})
export class NtfPopupQuestionComponent implements OnInit {

  @Input() questions: any[];
  @Input() isChild: boolean;
  constructor() { }

  ngOnInit(): void {
    console.log(this.questions);
  }

   
  onAnswerSelect(answer,question){
    for(let ans of question.answers)
    {
      ans.selected = false;
    }
    answer.selected = true;
    question.selectAnswer = answer;
  }


}
