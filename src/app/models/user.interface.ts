export interface AppUser {
  email: string;
  displayName: string;
  photoURL: string;
  rol: {
    user: boolean;
    admin?: boolean;
  };
}
