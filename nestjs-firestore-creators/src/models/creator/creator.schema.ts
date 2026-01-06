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

export interface Creator {
  id?: string;
  name: string;
  description: string;
  profilePicture: string;
  socialMediaPlatforms: {
    platform: SocialMediaPlatform;
    url: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
  impact: Impact;
}
