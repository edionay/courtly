export interface AuthenticatedUser {
  id: string;
  name: string;
  role: "user" | "admin";
}
