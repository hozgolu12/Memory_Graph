import {
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  NEUTRAL = 'neutral',
}

class PersonDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

class PlaceDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

class PhotoDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateMemoryDto {
  @IsString()
  text: string;

  @IsDateString()
  date: string;

  @IsEnum(EmotionType)
  emotion: EmotionType;

  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonDto)
  people: PersonDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceDto)
  places: PlaceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos: PhotoDto[];

  @IsArray()
  @IsString({ each: true })
  linkedMemories: string[];
}
