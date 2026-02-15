import { JwtPayload } from '../auth/jwt-payload.type';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

// Type-safe authenticated request
export interface AuthenticatedRequest extends Express.Request {
    user: JwtPayload;
}

export { };
