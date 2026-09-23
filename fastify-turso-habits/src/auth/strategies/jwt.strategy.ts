import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface TokenPayload {
  userId: number;
  tokenVersion: number;
}

export interface TokenPayload extends JWTPayload {
  userId: number;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy {
  private readonly secret: Uint8Array;
  private readonly issuer = 'yourapp';
  private readonly audience = 'yourapp-web';

  constructor(config: ConfigService) {
    this.secret = new TextEncoder().encode(
      config.getOrThrow<string>('JWT_SECRET'),
    );
  }

  async sign(payload: TokenPayload, expiresIn = '15m'): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(expiresIn)
      .sign(this.secret);
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload as TokenPayload;
  }
}
