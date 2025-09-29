import { IUser } from "../../app/modules/user/user.model";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser; // 👈 Add your custom property
    }
  }
}
