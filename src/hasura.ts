import {
  Meta,
  HasuraErrors,
  HasuraInsertResp,
  HasuraQueryResp,
  HasuraUpdateResp,
  Tables,
} from './typings.d';

/**
 * Get meta entries from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @returns {Promise<Meta[]>}
 */
export const queryMetaItems = async (table: Tables): Promise<Meta[]> => {
  const query = `
    {
      meta_${table}(order_by: {name: asc}) {
        id
        name
        table
        schema
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraQueryResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryMetaItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraQueryResp).data[`meta_${table}`];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Search meta entries from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @param {string} pattern meta item title
 * @returns {Promise<Meta[]>}
 */
export const searchMetaItems = async (
  table: Tables,
  pattern: string
): Promise<Meta[]> => {
  const query = `
    {
      meta_${table}(
        order_by: {name: asc},
        where: {name: {_iregex: ".*${pattern}.*"}}
      ) {
        id
        name
        table
        schema
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraQueryResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(searchMetaItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraQueryResp).data[`meta_${table}`];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Add meta entry to Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @param {Meta} item data to upload
 * @returns {Promise<string>}
 */
export const addMetaItem = async (
  table: Tables,
  item: Meta
): Promise<string> => {
  const query = `
    mutation {
        insert_meta_${table}_one(object: {
          name: "${item.name}",
          table: "${item.table}",
          schema: "${item.schema}"
        }) {
       }) {
        name
      }
    }
  `;

  try {
    const existing = await searchMetaItems(table, item.name);

    if (existing.length !== 0) {
      throw `(addMetaItem): Meta already exists.`;
    }

    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraInsertResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(addMetaItem) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraInsertResp).data[`insert_meta_${table}_one`].name;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Update meta entry to Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @param {string} id item id
 * @param {Meta} item data to update
 * @returns {Promise<string>}
 */
export const updateMetaItem = async (
  table: Tables,
  id: string,
  item: Meta
): Promise<string> => {
  const query = `
    mutation {
      update_meta_${table}(
        where: {id: {_eq: "${id}"}},
        _set: {
          name: "${item.name}",
          table: "${item.table}",
          schema: "${item.schema}"
         }
      ) {
        returning {
          name
        }
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraUpdateResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(updateMetaItem) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraUpdateResp)[`update_meta_${table}`].returning[0]
      .name;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
