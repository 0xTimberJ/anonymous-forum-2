/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let repo: Repository<Message>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    repo = module.get<Repository<Message>>(getRepositoryToken(Message));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a message', async () => {
    const dto: CreateMessageDto = { content: 'yo', pseudonym: 'bob' };
    const fakeMsg = { id: 1, ...dto, createdAt: new Date() };
    mockRepo.create.mockReturnValue(fakeMsg);
    mockRepo.save.mockResolvedValue(fakeMsg);
    const result = await service.create(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(fakeMsg);
    expect(result).toEqual(fakeMsg);
  });

  it('should return all messages sorted by createdAt', async () => {
    const now = new Date();
    const msgs = [
      {
        id: 2,
        content: 'b',
        pseudonym: 'b',
        createdAt: new Date(now.getTime() + 1000),
      },
      { id: 1, content: 'a', pseudonym: 'a', createdAt: now },
    ];
    mockRepo.find.mockResolvedValue(msgs);
    const result = await service.findAll();
    expect(mockRepo.find).toHaveBeenCalled();
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('should handle empty findAll', async () => {
    mockRepo.find.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
