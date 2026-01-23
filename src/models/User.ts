export interface User {
  id: number;
  name: string;
  admin: boolean;
}

export const createUser = (
  id: number,
  name: string,
  admin: boolean = false,
): User => ({
  id,
  name,
  admin,
});
