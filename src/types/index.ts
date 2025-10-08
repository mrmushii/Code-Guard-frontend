export type UserRole = 'student' | 'examiner';

export interface User {
  username: string;
  role: UserRole;
}