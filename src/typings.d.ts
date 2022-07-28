/* eslint-disable camelcase */
export type Types = 'Query' | 'Search' | 'Insert' | 'Update';

export type Tables = 'categories' | 'genres' | 'platforms' | 'tags';

export interface Meta {
  id?: string;
  name?: string;
  table: string;
  schema: string;
}

export interface HasuraInsertResp {
  data: {
    [key: string]: {
      name: string;
    };
  };
}

export interface HasuraUpdateResp {
  [key: string]: {
    returning: {
      name: string;
    }[];
  };
}

export interface HasuraQueryResp {
  data: {
    [key: string]: Meta[];
  };
}

export interface HasuraQueryAggregateResp {
  data: {
    [key: string]: {
      [key: string]: string;
    }[];
  };
}

export interface HasuraErrors {
  errors: {
    extensions: {
      path: string;
      code: string;
    };
    message: string;
  }[];
}

export interface RequestPayload {
  type: Types;
  table: Tables;
  data?: Meta;
  query?: string;
}
