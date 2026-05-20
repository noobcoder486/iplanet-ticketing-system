import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicService } from 'src/app/common/Services/dynamicService/dynamic.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  hide = true;
  chide = true;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dynamicService: DynamicService
  ) {}
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.pattern(/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/), Validators.minLength(5)]
      ],
      password: ['', Validators.required],
      cpassword: ['', Validators.required]
    });
  }
  get f() {
    return this.loginForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.dynamicService.validateAllFormFields(this.loginForm)){

      // stop here if form is invalid
      if (this.loginForm.invalid) {
        return;
      } else {
        this.router.navigate(['/dashboard/main']);
      }
    }
  }
}
