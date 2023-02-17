import { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import { GetResult } from "@supabase/postgrest-js/dist/module/select-query-parser";
import { GenericTable } from "@supabase/postgrest-js/dist/module/types";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

export type UpsertFetcher<T extends GenericTable, R> = (
  input: T["Insert"][]
) => Promise<R[]>;

export const buildUpsertFetcher =
  <
    S extends GenericSchema,
    T extends GenericTable,
    Q extends string = "*",
    R = GetResult<S, T["Row"], Q extends "*" ? "*" : Q>
  >(
    qb: PostgrestQueryBuilder<S, T>,
    query?: Q
  ): UpsertFetcher<T, R> =>
  async (input: T["Insert"][]): Promise<R[]> => {
    const { data } = await qb
      .upsert(input as any) // todo fix type
      .throwOnError()
      .select(query ?? "*");
    return data as R[]; // data cannot be null because of throwOnError()
  };
