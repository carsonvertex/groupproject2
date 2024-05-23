import { Request, Response, NextFunction } from 'express';


// export function checkAdminPermission(req: Request, res: Response, next: NextFunction): void {
//     const userLevel = req.session?.level;
  
//     if (userLevel === "admin" || userLevel === "super_admin") {
//       next();
//     } else {
//       res.status(403).json({ message: "Access denied, you are not admin" });
//     }
//   }
  
//   export function checkSuperAdminPermission(req: Request, res: Response, next: NextFunction): void {
//     const userLevel = req.session?.level;
  
//     if (userLevel === "super_admin") {
//       next();
//     } else {
//       res.status(403).json({ message: "Access denied, you are not super_admin" });
//     }
//   }

//   export function checkCustomerPermission(req: Request, res: Response, next: NextFunction): void {
//     const userLevel = req.session?.level;
//     console.log(userLevel)
  
//     if (userLevel === "customer" || userLevel === "admin" || userLevel === "super_admin") {
//       next();
//     } else {
//       res.status(403).json({ message: "Access denied" });
//     }
//   }

export function checkLoggedIn (req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    // User is logged in, proceed to the next middleware or route
    next();
  } else {
    // User is not logged in, redirect to the login page
    res.redirect("/login.html");
  }
};