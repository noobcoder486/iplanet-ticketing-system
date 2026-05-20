import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { ActivatedRoute } from '@angular/router';
import * as glob from 'src/app/config/global';
import xml2js from "xml2js";

@Component({
  selector: 'app-add-bulletin-board',
  templateUrl: './add-bulletin-board.component.html',
  styleUrls: ['./add-bulletin-board.component.css']
})
export class AddBulletinBoardComponent implements OnInit {
  bulletinBoardForm: FormGroup;
  formTitle: string = "Add";
  params: any;
  isEdit: boolean = false;
  errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dynamicService: DynamicService,
    private toastMessage: ToastrService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    

    this.bulletinBoardForm = this.formBuilder.group({
      Title: [null, Validators.required],
      Description: [null, Validators.required],
      BulletinData: [""]
    });
  }

  controlValidations() {
    let validate = true
    Object.keys(this.bulletinBoardForm.controls).forEach(field => {
      let controlValue = this.bulletinBoardForm.get(field).value;
      if (controlValue == null || controlValue == undefined) {
        this.toastMessage.error(field + " Cannot be Empty");
        validate = false
      }
    });
    return validate;
  }


  cancelfunction() {
    this.router.navigateByUrl('/auth/' + glob.getCompanyCode() + '/bulletin-board');
  }

  onSubmit() {
    if ( this.controlValidations() ) {
      const htmlData = `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Sales Report Module Added!</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #f5f5f5;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    padding: 50px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    background-color: white;
                    display: flex;
                    flex-direction: column;
                }
                h1 {
                    text-align: center;
                }
                .form-group {
                    margin-bottom: 30px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                .data-display {
                    width: 100%;
                    padding: 5px;
                    margin-top: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background-color: #f9f9f9;
                }
                .button {
                    display: inline-block;
                    width: 100%;
                    padding: 5px;
                    background-color: #28a745;
                    color: white;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .button:hover {
                    background-color: #218838;
                }
                .output {
                    margin-top: 20px;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background-color: #f9f9f9;
                }
            </style>
        </head>
        <body>

        <div class="container">
            <h1> ${this.bulletinBoardForm.controls['Title'].value}</h1>
            <div class="output" id="output">
                <h2>Description:</h2>
                <div class="data-display">
                    ${this.bulletinBoardForm.controls['Description'].value}
                </div>
                <h2>Additional Info:</h2>
                <div id="additional-function" class="data-display">
                    ${this.bulletinBoardForm.controls['BulletinData'].value}
                </div>
            </div>
        </div>

        </body>
        </html>
      `
      this.bulletinBoardForm.controls["BulletinData"].setValue(htmlData)
      let requestData = [];
      requestData.push({
        "Key": "APIType",
        "Value": "SaveBulletinBoard"
      });
      requestData.push({
        "Key": "Title",
        "Value": this.bulletinBoardForm.controls["Title"].value
      });
      requestData.push({
        "Key": "Description",
        "Value": this.bulletinBoardForm.controls["Description"].value
      });
      requestData.push({
        "Key": "BulletinData",
        "Value": this.bulletinBoardForm.controls["BulletinData"].value
      });

      let strRequestData = JSON.stringify(requestData);
      let contentRequest = {
        "content": strRequestData
      };
      this.dynamicService.getDynamicDetaildata(contentRequest).subscribe(
        {
          next: (value) => {
            let response = JSON.parse(value.toString());
            if (response.ReturnCode === '0') {
              this.toastMessage.success("Form Submitted Successfully");
              this.cancelfunction();
            } else {
              this.errorMessage = response.ReturnMessage;
              const parser = new xml2js.Parser({ strict: false, trim: true });
              parser.parseString(response.ErrorMessage, (err, result) => {
                if (err) {
                  console.error("Error parsing XML:", err);
                  this.toastMessage.error("An error occurred while processing your request.");
                } else {
                  response['errorMessageJson'] = result;
                  this.handleError(response);
                }
              });
            }
          },
          error: err => {
            if (err.includes('"message":"Cannot')) {
              // this.controlValidations()
            }
          }
        });
    }
  }

  handleError(response: any) {
    let errors = response.errorMessageJson.errorList.errorMessage;
    errors.forEach((error: any) => {
      let errorMessage = error.ERRORMESSAGE[0];
      this.toastMessage.error(errorMessage);
      console.error("Error:", errorMessage);
    });
  }
}
