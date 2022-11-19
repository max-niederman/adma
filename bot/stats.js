import fetch from "node-fetch";

const REST_ORIGIN = `http://${process.env.QUESTDB_HOST}:${process.env.QUESTDB_REST_PORT}`;

/**
 * @returns {Promise<number>}
 */
export async function getUserCount() {
    const query = `
        SELECT count_distinct(tag) FROM presence;
    `;

    const response = await fetch(`${REST_ORIGIN}/exec?query=${encodeURIComponent(query)}`)
    const json = await response.json();

    return json.dataset[0][0];
}

/**
 * @returns {Promise<number>}
 */
export async function getUpdateCount() {
    const query = `
        SELECT count() FROM presence;
    `;

    const response = await fetch(`${REST_ORIGIN}/exec?query=${encodeURIComponent(query)}`)
    const json = await response.json();

    return json.dataset[0][0];
}