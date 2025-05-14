import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The content of the message', example: 'Hello' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The pseudonym of the message', example: 'John' })
  pseudonym: string;
}
