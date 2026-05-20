import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
import { GsxService } from 'src/app/common/Services/gsxService/gsx.service';
import { CaseDetail } from '../../repair-process.metadata';
import { v4 as uuidv4 } from 'uuid';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownDataService } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownValue } from 'src/app/common/Services/dropdownService/dropdown-data.service';
import { DropDownType } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { ComboSelectorComponent } from 'src/app/spotn-shared/combo-selector/combo-selector.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-diagnosis-view',
  templateUrl: './diagnosis-view.component.html',
  styleUrls: ['./diagnosis-view.component.sass']
})
export class DiagnosisViewComponent implements OnInit {

  imageurls = [];
  typeSelected = 'ball-clip-rotate';
  
  IssuesList: any[] = [];
  selectedList = [] = [];
  ComponentList: any[] = [];
  ComponentIssueList: any[] = [];
  SelectedComponentIssue: any[] = [];
  compoissuelist: any[] = [];

  diagnosisViewForm1: FormGroup;
  
  reproducibility: DropDownValue = DropDownValue.getBlankObject();


  constructor(
    private dropdownDataService: DropdownDataService,
    private gsxService: GsxService,
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    private ngxSpinnerService:NgxSpinnerService,
   ) {
      this.diagnosisViewForm1 = this.formBuilder.group({
        component: [null, [Validators.required]],
        issues: [null, [Validators.required]],
      });
   }

  @Output() addComponentIssueEvent = new EventEmitter<any>();
  //@Output() parentcomponent: EventEmitter<any> = new EventEmitter()

   @Input() repa : CaseDetail;
  ngOnInit(): void {
    this.diagnosisViewForm1 = this.formBuilder.group({
      component: [null, [Validators.required]],
      issues: [null, [Validators.required]],
      Reproducibility: [null , [Validators.required]]
    });

    this.get_Component_Issue()
    this.onSelectComponent({ term: "", items: [] });
    this.onSelectIssue({ term: "", items: [] })
    this.getReproducibility({ term: "", items: []})
  }
  
  getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

  onSelectComponent($event) {this.IssuesList = $event.issues;}
  onSelectIssue($event: { term: string; items: any[] }) {}
 

  get_Component_Issue() {
    this. ngxSpinnerService.show()


    let searchData = { device: { "id": this.repa.SerialNo1 } };
    let strRequestData = JSON.stringify(searchData);
    let contentRequest = {
      "content": strRequestData
    };
    this.gsxService.getComponentIssue(contentRequest).subscribe(
      {
        next: (value) => {
           ;
          console.log("My Values:", value);
          let response = JSON.parse(value.toString());
          if(response.errors != null || response.errors != undefined){
              if (Array.isArray(response.errors)){
                response.errors.forEach(err => 
                  this.toast.error(err.message)
                  )
              }
              else{
                this.toast.error(response.errors.message);
              }
          }
          // {"errorId":"b1a5cc69-a9aa-4f19-9600-55beb9373055","errors":[{"code":"DEVICE_INFORMATION_INVALID","message":"Invalid Device Information."}]}
          this.ComponentIssueList = response.componentIssues;
          this.ComponentList = this.ComponentIssueList;
          console.log("my dropdown values is:1",this.ComponentIssueList)
          console.log("my dropdown values is:2",this.ComponentList)
          this. ngxSpinnerService.hide();
        }
      });
  }

  getReproducibility($event: { term: string; items: any[] }) {
    this.dropdownDataService.fetchDropDownData(DropDownType.Reproducibility, $event.term, {
    }).subscribe({
      next: (value) => {
        if (value != null) {
          console.log(value);
          this.reproducibility = value;
        }
      },
      error: (err) => {
        this.reproducibility = DropDownValue.getBlankObject();
      }
    });
  }

  onComponentIssuesSubmit() {
     ;
    if (this.diagnosisViewForm1.valid) {
      let object = {
        "component": this.diagnosisViewForm1.get("component").value,
        "issues": this.diagnosisViewForm1.get("issues").value,
        "Reproducibility": this.diagnosisViewForm1.get("Reproducibility").value

      };
        var object1 ={
          "DiagnosisDetailGUID":uuidv4(),
          "ComponentCode": object.component.componentCode,
          "ComponentDesc": object.component.componentDescription,
          "IssueCode" :   object.issues.code,
          "IssueDesc" : object.issues.description,
          "ReproducibilityCode": object.Reproducibility.Id,
          "ReproducibilityDescription": object.Reproducibility.TEXT,
          "isDeleted":0
        }

        let selectedcomponent: any[] = [];
        selectedcomponent.push(object1);

        this.addComponentIssueEvent.emit(selectedcomponent);
    
  }

    
    console.log("Test" , this.compoissuelist)
      
  }
    
  
  isComponentIssuesPop: boolean = false 

}
