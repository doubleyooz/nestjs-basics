import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { User } from './decorators/user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify Firebase ID token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        uid: { type: 'string' },
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    const decodedToken = await this.authService.verifyToken(
      verifyTokenDto.idToken,
    );
    return {
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Email and Password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            uid: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async login(@Body() loginDto: LoginDto) {
    const decodedToken = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return {
      ...decodedToken,
    };
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user (revoke refresh tokens)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@User() user: DecodedIdToken) {
    await this.authService.revokeRefreshTokens(user.uid);
    return {
      message: 'Logout successful. All refresh tokens have been revoked.',
    };
  }

  @Patch('reset-password')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@User() user: DecodedIdToken) {
    await this.authService.revokeRefreshTokens(user.uid);
    return {
      message:
        'Password reset successful. All refresh tokens have been revoked.',
    };
  }

  @Patch('change-password')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    await this.authService.updatePasswordWithVerification(updatePasswordDto);
    return {
      message: 'Password changed successfully.',
    };
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@User() user: DecodedIdToken) {
    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  }
}
