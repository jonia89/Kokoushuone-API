import { getUserDataById } from "../db/usersDb";

export async function isAdmin(userId: number): Promise<boolean> {
  const user = await getUserDataById(userId);
  if (!user) return false;
  return user.user.admin || false;
}
