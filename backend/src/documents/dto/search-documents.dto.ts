import {
  IsOptional,
  IsString,
  MaxLength,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

/** Valid MIME type groups for the `type` filter */
const ALLOWED_TYPES = ['pdf', 'image', 'text', 'all'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

/** Valid sort fields */
const SORT_FIELDS = ['createdAt', 'title', 'size'] as const;
type SortField = typeof SORT_FIELDS[number];

const SORT_ORDERS = ['asc', 'desc'] as const;
type SortOrder = typeof SORT_ORDERS[number];

export class SearchDocumentsDto {
  /**
   * Full-text search query.
   * Matches against title, description, originalName and tags.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La búsqueda no puede superar los 200 caracteres.' })
  q?: string;

  /** Filter by category name. 'null' matches uncategorized documents. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  /** Filter by MIME type group: pdf | image | text | all */
  @IsOptional()
  @IsIn(ALLOWED_TYPES, { message: `El tipo debe ser uno de: ${ALLOWED_TYPES.join(', ')}` })
  type?: AllowedType;

  /** Field to sort by */
  @IsOptional()
  @IsIn(SORT_FIELDS, { message: `El campo de ordenación debe ser uno de: ${SORT_FIELDS.join(', ')}` })
  sortBy?: SortField;

  /** Sort direction */
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;

  /** Number of results to return (1-100, default 50) */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Offset for pagination */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset?: number;
}
