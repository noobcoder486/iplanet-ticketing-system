import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Controller } from 'src/app/config/comman.const';
import { ApiService } from 'src/app/core/service/api.service';
import { Columns } from 'src/app/models/column.metadata';

@Injectable({
  providedIn: 'root'
})
export class emailValidatorService {

  constructor(private apiService: ApiService) { }
  validateEmail = (data) => {
    return this.apiService.getData(Controller.EmailValidator + 'validate-email/?email=' +data);
  }


}
