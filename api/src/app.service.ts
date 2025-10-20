import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from CI/CD with Terraform Cloud! 🚀';
  }
}
