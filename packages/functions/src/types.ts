export enum UserTypes {
  TenantAdmin = 'tenantAdmin',
  TenantUser = 'tenantUser',
  SystemAdmin = 'systemAdmin'
};

export interface IUser {
  userID: string;
  tenantID: string;
  email: string;
  picture: string;
  name: string;
  sub: string;
  userType: UserTypes
};
