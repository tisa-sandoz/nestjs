//Before allowing access to a route, check if the user is authenticated via session.
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    //You extract request
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.session?.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    return true;
  }
}
