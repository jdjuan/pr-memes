export interface AppUser {
  email: string;
  displayName: string;
  photoURL: string;
  role: {
    user: boolean;
    admin?: boolean;
  };
}
