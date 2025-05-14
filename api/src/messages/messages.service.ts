import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    const messages = await this.messagesRepository.find();
    console.log('messages', messages);
    return messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
