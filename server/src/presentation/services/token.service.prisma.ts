import { prisma } from "../../data/prisma/prisma-db"



export class TokenService {
  private static EXPIRATION_MINUTES = 15

  static async createOrUpdateToken(userId: string): Promise<string> {
    try {
      const token = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
      const expiresAt = new Date(Date.now() + this.EXPIRATION_MINUTES * 60 * 1000);

      await prisma.verificationToken.upsert({
        where: {
          userId,
        },
        update: {
          token,
          expiresAt,
        },
        create: {
          userId,
          token,
          expiresAt,
        },
      });

      return token;
    } catch (error) {
      console.error('Error in createOrUpdateToken:', error);
      throw new Error('Failed to create or update verification token');
    }
  }

  static async validateToken(userId: string, token: string): Promise<boolean> {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: {
        userId: userId,
      },
    })

    if (!tokenRecord) {
      return false
    }

    const isValid = tokenRecord.token === token &&
                   tokenRecord.expiresAt > new Date() &&
                   tokenRecord.userId === userId

    if (!isValid) {
      // Si el token no es válido o está expirado, lo eliminamos
      await prisma.verificationToken.delete({
        where: {
          userId: userId,
        },
      })
    }

    return isValid
  }
}
