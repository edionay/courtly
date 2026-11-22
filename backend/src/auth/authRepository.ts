import { getPrismaClient } from "../database";

export class AuthRepository {
  public findByEmail(email: string) {
    return getPrismaClient().user.findUnique({
      where: { email },
      select: { id: true, name: true, role: true, passwordHash: true },
    });
  }
}
