import { getUserById } from "../db/usersDb";

export async function isAdmin(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.admin || false;
}
