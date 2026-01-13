import { AbstractDocument } from 'src/database/abstract.document';

export enum Impact {
  'low',
  'medium',
  'high',
  'very high',
}

export enum SocialMediaPlatform {
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'linkedin',
  'github',
  'website',
}

export interface Creator extends AbstractDocument {
  name: string;
  description: string;
  profilePicture: string;
  socialMediaPlatforms: {
    platform: SocialMediaPlatform;
    url: string;
  }[];
  impact: Impact;
}
