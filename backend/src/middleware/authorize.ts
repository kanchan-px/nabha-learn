import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";

export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to do this" });
    }

    next();
  };
}
