
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  

  if (!token) {
     res.status(401).json({ error: "Unauthorized: No token provided" });
     return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log(error);
    
    if (error.name === "TokenExpiredError") {
      res.status(403).json({ error: "TokenExpired" }); // Specific response for expired token
      return 
    }
   res.status(403).json({ error: "Invalid token" });
   return 
  }
};
