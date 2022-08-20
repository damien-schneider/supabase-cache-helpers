import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { sortSearchParams, encodeObject, isObject } from "./lib";
import {
  PostgrestQueryParser,
  PostgrestQueryParserOptions,
} from "./postgrest-query-parser";

export class PostgrestParser<
  Table extends Record<string, unknown>,
  Result
> extends PostgrestQueryParser {
  private readonly _url: URL;
  private readonly _headers: { [key: string]: string };
  private readonly _body: object | undefined;
  private readonly _method: "GET" | "HEAD" | "POST" | "PATCH" | "DELETE";

  public readonly queryKey: string;
  public readonly bodyKey: string | undefined;
  public readonly count: string | null;
  public readonly schema: string | undefined;
  public readonly table: string;
  public readonly isHead: boolean | undefined;

  constructor(
    fb: PostgrestFilterBuilder<Table, Result>,
    public readonly opts?: PostgrestQueryParserOptions
  ) {
    super(new URL(fb["url"]).searchParams.toString(), opts);

    this._url = new URL(fb["url"]);
    this._headers = { ...fb["headers"] };
    this._body = isObject(fb["body"]) ? { ...fb["body"] } : undefined;
    this._method = fb["method"];

    this.queryKey = sortSearchParams(this._url.searchParams).toString();

    this.table = this._url
      .toString()
      .split("/rest/v1/")
      .pop()
      ?.split("?")
      .shift() as string;

    if (this._body) {
      this.bodyKey = encodeObject(this._body as Record<string, unknown>);
    }

    // 'Prefer': return=minimal|representation,count=exact|planned|estimated
    const preferHeaders: Record<string, string> = (
      this._headers["Prefer"] ?? ""
    )
      .split(",")
      .reduce<Record<string, string>>((prev, curr) => {
        const s = curr.split("=");
        return {
          ...prev,
          [s[0]]: s[1],
        };
      }, {});
    this.count = preferHeaders["count"] ?? null;

    this.schema =
      this._headers["Accept-Profile"] ??
      this._headers["Content-Profile"] ??
      undefined;

    this.isHead = this._method === "HEAD";
  }
}