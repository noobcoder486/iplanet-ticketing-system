export const GLOBALVARIABLE = {

//SERVER_LINK: 'http://localhost:52628/',
// SERVER_LINK: 'http://103.96.251.106:7070/',
//  SERVER_LINK: 'http://103.96.251.106:7070/nitcgsxapi/',
// SERVER_LINK: 'https://carecrm.iplanet.one/testgsxapi/',
//SERVER_LINK: 'https://crm.mapletechnologies.org:6363/nitcgsxapi/',
// SERVER_LINK: 'https://workscanqa.ril.com/gsxapi/',
//SERVER_LINK: 'https://workscan.ril.com/gsxapi/',

  SERVER_LINK: 'https://carecrm.iplanet.one/nitcgsxapi/',
  //SERVER_LINK: 'http://192.168.64.171:8085/api/',
  //SERVER_LINK: 'http://103.96.251.91/nitcgsxapi/',
 // SERVER_LINK: 'http://103.96.251.91/iplanetapi/' ,
  API_LINK: 'api/',
  TOKEN: "TOKEN",
  REFRESHTOKEN: "REFRESHTOKEN",
  USERNAME: "USERNAME",
  
};
export let IsIdleTimeOut = false;
export function setIdleTimeout(value: boolean) {
  IsIdleTimeOut = value;
  console.log('Timeout value', IsIdleTimeOut);
}
export function getIdleTimeout() : boolean {
  return IsIdleTimeOut;
}
export let CompanyCode: String  = "";
export let logedinUser:any

export function getCompanyCode(): String {
  CompanyCode = sessionStorage.getItem("CompanyCode")
  return CompanyCode;
}

export function setCompanyCode(value: String) {
  CompanyCode = value;
  sessionStorage.setItem("CompanyCode",CompanyCode.toString());
}

export function setLogedInUser(value: any) {
  logedinUser=value
  console.log("login Data",  logedinUser)
  sessionStorage.setItem("logedinUser",JSON.stringify(value));
}

export function getLogedInUser():any {
  logedinUser= JSON.parse(sessionStorage.getItem("logedinUser"))
  return logedinUser
}



export enum Controller {
    Register = 'Register/',
    Menu = 'Menu/',
    SystemAdministrator = 'SystemAdministrator/',
    Custom = 'Custom/',
    Dynamic = 'Dynamic/',
    GSX = 'GSX/',
    Report='Report/'
} 

export enum CommonMessage {
    ErrorMessge = 'Something went wrong, Please try again or contact system administrator',
    DeleteMessge = 'Record deleted successfully',
}
