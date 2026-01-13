/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google-redirect',
      scope: ['email', 'profile'],
    });
  }

  // Make it async and properly typed
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile, // ← proper type instead of any
    done: VerifyCallback,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error('No email found in Google profile'));
      throw new Error('No email found in Google profile'); // reject the promise
    }

    const user = {
      googleId: profile.id,
      email,
      firstName: profile.name?.givenName ?? '',
      lastName: profile.name?.familyName ?? '',
      picture: profile.photos?.[0]?.value ?? '',
      accessToken,
      refreshToken,
    };

    done(null, user);
    return user;
  }
}
