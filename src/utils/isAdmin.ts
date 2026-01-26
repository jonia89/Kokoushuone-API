import { users } from "../db/usersDb";

export function isAdmin(userId: number): boolean {
  const user = users.find((u) => u.id === userId);
  if (user) {
    return user.admin;
  }
  return false;
}
