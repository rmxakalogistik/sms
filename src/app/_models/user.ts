// import { Role } from "./role";

export class User {
  // role: Role;
  // token?: string;

  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id: string;
  connectionId: string;
  connecion: any;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fonction: string;
  gender: string;
  phonetxt: string;
  shownumuni: string;
  station: any;
  //stationIsOps: any;
  //Fosa: any;
  //Commune: any;
  //_passedCommuness: any;
  //_passedCommune: any;
  role: ReadonlyArray<any>;
  '.issued': string;
  '.expires': string;
}
