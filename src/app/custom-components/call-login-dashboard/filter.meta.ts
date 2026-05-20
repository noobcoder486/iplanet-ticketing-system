export class Filter {
  type: String;
  title: String;
  value: any;

  constructor(ttype: String,ttitle: String,tvalue: any) {
    this.type = ttype;
    this.value = tvalue;
    this.title = ttitle;
  }
}
