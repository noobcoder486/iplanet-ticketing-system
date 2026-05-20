import { Component, Input, SimpleChanges, Output, OnInit, EventEmitter, Inject } from '@angular/core';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CaseDetail } from '../../repair-process.metadata';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ntf-popup',
  templateUrl: './ntf-popup.component.html',
  styleUrls: ['./ntf-popup.component.css']
})
export class NtfPopupComponent implements OnInit {

  @Input() repa: CaseDetail;
  // @Output() RepairQuestions = new EventEmitter<any>();
  errorMessage: any;
  questions: any;
  questionDetails: any[] = [];
  isToSavedisabled: boolean = true;
  currentQuestion: any;
  constructor(
    private dynamicService: DynamicService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private gsxService: GsxService,
    public dialogRef: MatDialogRef<NtfPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  

  ngOnInit(): void {
    if (!(this.data == undefined || this.data == null)) {
      this.questions = this.data;
    }
    else {
      this.dialogRef.close();
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repa']) {
      if (this.repa != null && this.repa != undefined) {
        if (this.repa.RepairFlag == 1) {
          if (this.questions = this.repa.REPAIR.RepairQuestions != "") {
            this.questions = JSON.parse(this.repa.REPAIR.RepairQuestions)
          }
        }
      }
    }
  }

  // getQuestions(objData) {
  //   if (this.repa?.RepairFlag == 1) {
  //     return;
  //   }
  //   this.spinner.show()
  //   let searchData = objData
  //   let strRequestData = JSON.stringify(searchData);
  //   let contentRequest = {
  //     "content": strRequestData
  //   };
  //   this.gsxService.getRepairQuestions(contentRequest).subscribe(
  //     {
  //       next: (value) => {
  //         this.spinner.hide()
  //         let response = JSON.parse(value.toString());
  //         console.log("feedback", response);
  //         if (!(response.errors == undefined || response.errors == null)) {
  //           this.errorMessage = "";
  //           for (let iCtr = 0; iCtr < response.errors.length; iCtr++) {
  //             this.errorMessage = response.errors[iCtr].code + ' - ' + response.errors[iCtr].message;
  //             this.toastr.error(this.errorMessage, "Error", { closeButton: true, disableTimeOut: true })
  //           }
  //         }
  //         else {
  //           this.questions = response.questionDetails;
  //         }
  //       }
  //     }
  //   );
  // }



  onSave() {
    ''
    this.questionDetails = null;
    if (this.questions != null) {
      for (let template of this.questions) {
        var isTemplateAdded = false;
        var template1 = null;
        for (let tree of template.trees) {
          var newquestionDetails = this.getQuestionAnswer(tree.questions)
          if (newquestionDetails) {
            if (!this.questionDetails) {
              this.questionDetails = [];
            }
            if (isTemplateAdded == false) {
              template1 = {
                "templateId": template.templateId,
                "trees": []
              }
            }
            template1.trees.push({
              "treeId": tree.treeId,
              "questions": newquestionDetails
            })
            this.questionDetails.push(template1)
          }
        }
      }
    }

    if (this.data != undefined && this.data != null)
    {
      this.dialogRef.close(this.questionDetails)
    }
  }

  getQuestionAnswer(questions) {
    var questionDetails = null
    for (let question of questions) {
      if (question.selectAnswer != undefined && question.selectAnswer != null && question.selectAnswer != '' && question.answerType != 'INT' && question.answerType != 'FFB' && question.answerType != 'BBX') {

        if (typeof question.selectAnswer === 'string') {
          if (question.selectAnswer.toString().trim() != '') {
            if (questionDetails == null) {
              questionDetails = [];
            }
            var quest = {
              "questionId": question.questionId,
              "answers": []
            }
            quest.answers.push({
              "answerId": question.selectAnswer.answerId,
              "answerPhrase": question.selectAnswer.answerPhrase
            })
            if (!(quest == null || quest == undefined)) {
              questionDetails.push(quest)
            }

          }
        }
        else {
          if (question.selectAnswer.questions != null) {
            var newquestions = this.getQuestionAnswer(question.selectAnswer.questions)
            if (questionDetails == null) {
              questionDetails = [];
            }

            var quest = {
              "questionId": question.questionId,
              "answers": []
            }
            if (newquestions != null && newquestions != undefined) {
              quest.answers.push({
                "answerId": question.selectAnswer.answerId,
                "answerPhrase": question.selectAnswer.answerPhrase,
                "questions": newquestions
              })

            }
            else {
              quest.answers.push({
                "answerId": question.selectAnswer.answerId,
                "answerPhrase": question.selectAnswer.answerPhrase
              })

            }
            if (!(quest == null || quest == undefined)) {
              questionDetails.push(quest)
            }


          }
          else {
            if (questionDetails == null) {
              questionDetails = [];
            }
            var quest = {
              "questionId": question.questionId,
              "answers": []
            }
            quest.answers.push({
              "answerId": question.selectAnswer.answerId,
              "answerPhrase": question.selectAnswer.answerPhrase,
            })

            if (!(quest == null || quest == undefined)) {
              questionDetails.push(quest)
            }

          }

        }
      }

    }
    return questionDetails;
  }

  isToEnableSaveButton() {
    if (this.questions != null) {
      for (let template of this.questions) {
        for (let tree of template.trees) {
          let value = !this.isQuestionIsAnswered(tree.questions);
          return value;
        }
      }
    }
    return true;
  }


  isQuestionIsAnswered(questions): boolean {
    let isValid = true;
    for (let question of questions) {
      if (question.selectAnswer != null) {

        if (typeof question.selectAnswer === 'string') {
          if (question.selectAnswer.toString().trim() != '') {
            isValid = isValid && true;
          } else {
            isValid = isValid && false;
          }
        } else {
          if (question.selectAnswer.questions != null) {
            isValid = isValid && this.isQuestionIsAnswered(question.selectAnswer.questions);
          } else {
            isValid = isValid && true;
          }
        }

      } else {
        isValid = isValid && false;
      }
    }
    return isValid;
  }

}
