export interface User {
  id: number;
  name: string;
  admin: boolean;
}
// Käyttäjällä ei ole oletusarvoisesti ylläpitäjän oikeuksia
export const createUser = (
  id: number,
  name: string,
  admin: boolean = false,
): User => ({
  id,
  name,
  admin,
});
