import { DecodedKey } from './types';
import { PostgrestFilter } from '../postgrest-filter';
import { PostgrestQueryParserOptions } from '../postgrest-query-parser';

export type RevalidateRelationOpt<Type> = {
  schema?: string;
  relation: string;
  relationIdColumn: string;
  fKeyColumn: keyof Type;
};

export type RevalidateRelations<Type extends Record<string, unknown>> =
  RevalidateRelationOpt<Type>[];

export type RevalidateRelationsProps<Type extends Record<string, unknown>> = {
  input: Type;
  decodedKey: Pick<DecodedKey, 'schema' | 'table' | 'queryKey'>;
  getPostgrestFilter: (
    query: string,
    opts?: PostgrestQueryParserOptions,
  ) => Pick<PostgrestFilter<Type>, 'applyFilters'>;
};

export const shouldRevalidateRelation = <Type extends Record<string, unknown>>(
  relations: RevalidateRelations<Type>,
  {
    input,
    getPostgrestFilter,
    decodedKey: { schema, table, queryKey },
  }: RevalidateRelationsProps<Type>,
): boolean =>
  Boolean(
    relations.find(
      (r) =>
        (!r.schema || r.schema === schema) &&
        r.relation === table &&
        getPostgrestFilter(queryKey, {
          exclusivePaths: [r.relationIdColumn],
        }).applyFilters({
          [r.relationIdColumn]: input[r.fKeyColumn],
        }),
    ),
  );
