import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía.' })
  @MaxLength(500, { message: 'La pregunta no puede superar los 500 caracteres.' })
  question: string;
}
