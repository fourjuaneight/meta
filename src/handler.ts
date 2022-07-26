import {
  addMetaItem,
  queryMetaItems,
  searchMetaItems,
  updateMetaItem,
} from './hasura';
import { version } from '../package.json';

import { Meta, RequestPayload } from './typings.d';

// default responses
const responseInit = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
};
const badReqBody = {
  status: 400,
  statusText: 'Bad Request',
  ...responseInit,
};
const errReqBody = {
  status: 500,
  statusText: 'Internal Error',
  ...responseInit,
};
const noAuthReqBody = {
  status: 401,
  statusText: 'Unauthorized',
  ...responseInit,
};

const missingData = (data: Meta | undefined): boolean => {
  if (data) {
    const typedData = data as Meta;
    const cleanData = Object.keys(typedData)
      .reduce(
        (acc, key) => [...acc, { key, value: typedData[key] }],
        [] as { key: string; value: string }[]
      )
      .filter(item => item.key !== 'id');
    const missing = Object.values(cleanData).some(value => value === undefined);

    return missing;
  }

  return true;
};

/**
 * Helper method to determine which type/category to use.
 * @function
 * @async
 *
 * @param payload request payload
 * @returns {Promise<Response>} response
 */
const handleAction = async (payload: RequestPayload): Promise<Response> => {
  try {
    // determine which type and method to use
    switch (true) {
      case payload.type === 'Insert': {
        const insertData = payload.data as Meta;
        const saved = await addMetaItem(payload.table, insertData);

        return new Response(
          JSON.stringify({
            saved,
            table: payload.table,
            location: payload.type,
            version,
          }),
          responseInit
        );
        break;
      }
      case payload.type === 'Update': {
        const updateData = payload.data as Meta;
        const updated = await updateMetaItem(
          payload.table,
          updateData.id as string,
          updateData
        );

        return new Response(
          JSON.stringify({
            updated,
            table: payload.table,
            location: payload.type,
            version,
          }),
          responseInit
        );
        break;
      }
      case payload.type === 'Search': {
        const searchPattern = payload.query as string;
        const searchItems = await searchMetaItems(payload.table, searchPattern);

        return new Response(
          JSON.stringify({
            items: searchItems,
            table: payload.table,
            version,
          }),
          responseInit
        );
        break;
      }
      default: {
        const queryItems = await queryMetaItems(payload.table, payload.data);

        return new Response(
          JSON.stringify({
            items: queryItems,
            table: payload.table,
            version,
          }),
          responseInit
        );
        break;
      }
    }
  } catch (error) {
    console.log('handleAction', error);
    return new Response(
      JSON.stringify({
        error,
        table: payload.table,
        location: payload.type,
        version,
      }),
      errReqBody
    );
  }
};

/**
 * Handler method for all requests.
 * @function
 * @async
 *
 * @param {Request} request request object
 * @returns {Promise<Response>} response object
 */
export const handleRequest = async (request: Request): Promise<Response> => {
  // POST requests only
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ version }), {
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  // content-type check (required)
  if (!request.headers.has('content-type')) {
    return new Response(
      JSON.stringify({
        error: "Please provide 'content-type' header.",
        version,
      }),
      badReqBody
    );
  }

  const contentType = request.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const payload: RequestPayload = await request.json();
    const key = request.headers.get('key');

    // check for required fields
    switch (true) {
      case !payload.type:
        return new Response(
          JSON.stringify({ error: "Missing 'type' parameter.", version }),
          badReqBody
        );
      case !payload.table:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter.", version }),
          badReqBody
        );
      case payload.type === 'Insert' && missingData(payload.data):
        return new Response(
          JSON.stringify({ error: 'Missing Insert data.', version }),
          badReqBody
        );
      case payload.type === 'Update' && missingData(payload.data):
        return new Response(
          JSON.stringify({ error: 'Missing Update data.', version }),
          badReqBody
        );
      case payload.type === 'Search' && !payload.query:
        return new Response(
          JSON.stringify({ error: 'Missing Search query.', version }),
          badReqBody
        );
      case !key:
        return new Response(
          JSON.stringify({ error: "Missing 'key' header.", version }),
          noAuthReqBody
        );
      case key !== AUTH_KEY:
        return new Response(
          JSON.stringify({
            error: "You're not authorized to access this API.",
            version,
          }),
          noAuthReqBody
        );
      default: {
        return handleAction(payload);
      }
    }
  }

  // default to bad content-type
  return new Response(JSON.stringify({ version }), {
    status: 415,
    statusText: 'Unsupported Media Type',
  });
};
