import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config/jwt";
import { IUser, UserModel } from "../../data/mongodb";
import { prisma } from "../../data/prisma/prisma-db";
import { User } from "@prisma/client";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userPrisma?: User;
    }
  }
}

export class AuthMiddleware {

  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header('Authorization');
    if (!authorization) {
      return res.status(401).json({ error: 'No token provided' });
    }
    if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid Bearer token' });

    const token = authorization.split(' ')[1] || '';

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);
      if (!payload) return res.status(401).json({ error: 'Invalid token - user' });
      //*mongodb
      // Determinar la fuente basándose en el formato del ID
      const isMongoId = Types.ObjectId.isValid(payload.id);
      if (isMongoId) {
        // Buscar en MongoDB
        const user = await UserModel.findById(payload.id).select('id name email');
        if (!user) return res.status(401).json({ error: 'Invalid token - user not found in MongoDB' });
        req.user = user;
      }
      //*prisma
      const userPrisma = await prisma.user.findUnique({ where: { id: payload.id } });
      // if (!userPrisma) return res.status(401).json({ error: 'Invalid token' });
      if (!userPrisma && !req.user) {
        return res.status(401).json({ error: 'Invalid token - user not found' });
      }

      if (userPrisma) {
        req.userPrisma = userPrisma;
      }

      //todo: validar si el usuario esta activo
      // if (!user.status) return res.status(401).json({ error: 'User is not active' });
      // req.user = user;

      // req.userPrisma = userPrisma;
      next();

    } catch (error) {
      console.log(error);
      res.status(200).json({ error: 'Internal server error' })

    }
  }

  static async isAdminRole(req: Request, res: Response, next: NextFunction) {
    if (!req.body.user) {
      return res.status(500).json({
        msg: 'Se quiere verificar el role sin validar el token primero',
      });
    }
    const user = req.body.user;

    if (user.role[0] !== 'ADMIN_ROLE') {
      return res.status(401).json({
        error: 'User is not admin'
      })
    }
    next();
  }


  static async isAdminRoleOrSameUser(req: Request, res: Response, next: NextFunction) {
    if (!req.body.user) {
      return res.status(500).json({
        msg: 'Se quiere verificar el role sin validar el token primero',
      });
    }
    const user = req.body.user;

    if (user.role[0] !== 'ADMIN_ROLE' && user.id !== req.params.id) {
      return res.status(401).json({
        error: 'User is not admin or same user'
      })
    }
    next();
  }

}
