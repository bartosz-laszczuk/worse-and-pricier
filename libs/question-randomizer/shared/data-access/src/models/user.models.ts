export interface User {
  uid: string;
  name?: string;
  photoURL?: string;
  email?: string;
  country?: string;
  about?: string;
  roleId?: string;
  emailVerified?: boolean;
}
