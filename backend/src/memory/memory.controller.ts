import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MemoryService } from './memory.service';
import { CreateMemoryDto, UpdateMemoryDto } from './dto';

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  create(@Body() createMemoryDto: CreateMemoryDto) {
    return this.memoryService.create(createMemoryDto);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.memoryService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.memoryService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMemoryDto: UpdateMemoryDto,
    @Query('userId') userId: string,
  ) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.memoryService.update(id, updateMemoryDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.memoryService.remove(id, userId);
  }
}
