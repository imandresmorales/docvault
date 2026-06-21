import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDocumentDto {
  /**
   * New title for the document.
   * Minimum 1 character after trimming, maximum 255.
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(1, { message: 'El título no puede estar vacío.' })
  @MaxLength(255, { message: 'El título no puede superar los 255 caracteres.' })
  title?: string;

  /** Optional description — stripped of leading/trailing whitespace. */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres.' })
  description?: string;

  /** Category string. Pass empty string to clear the category. */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La categoría no puede superar los 100 caracteres.' })
  category?: string | null;

  /**
   * Comma-separated tag string.
   * Example: "informe,2024,legal"
   * Tags are lowercased and de-duplicated server-side.
   * Only alphanumeric characters, hyphens and Spanish letters are allowed per tag.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las etiquetas no pueden superar los 500 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ,\-\s]*$/, {
    message: 'Las etiquetas solo pueden contener letras, números, guiones y comas.',
  })
  tags?: string;
}
