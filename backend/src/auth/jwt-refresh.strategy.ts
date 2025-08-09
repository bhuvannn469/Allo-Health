import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req) => {
        // Extract refresh token from request body or headers
        return req?.body?.refreshToken || req?.headers?.['x-refresh-token'];
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const refreshToken = req?.body?.refreshToken || req?.headers?.['x-refresh-token'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const isValidRefreshToken = await this.authService.validateRefreshToken(
      refreshToken,
      payload.sub,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
