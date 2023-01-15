import { AuthGuard } from "@nestjs/passport";

export class JwtAuthGuar extends AuthGuard('jwt'){}