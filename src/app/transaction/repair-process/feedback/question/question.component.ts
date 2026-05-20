import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {

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
