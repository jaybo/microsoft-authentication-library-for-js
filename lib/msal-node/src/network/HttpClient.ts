/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INetworkModule, NetworkRequestOptions } from '@azure/msal-common';
import { method } from './../utils/NodeConstants';

const axios = require('axios');

/**
 * This class implements the Fetch API for GET and POST requests. See more here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
export class HttpClient implements INetworkModule {
    /**
     * Axios library for REST endpoints - Get request
     * @param url
     * @param headers
     * @param body
     */
    async sendGetRequestAsync<T>(
        url: string,
        options?: NetworkRequestOptions
    ): Promise<T> {
        // axios config
        const config = {
            method: method.GET,
            url: url,
            headers: HttpClient.getHeaders(options),
        };

        // GET call
        const response = await axios(config);
        return (await response.json()) as T;
    }

    /**
     * Axios Client for REST endpoints - Post request
     * @param url
     * @param headers
     * @param body
     */
    async sendPostRequestAsync<T>(
        url: string,
        options?: NetworkRequestOptions
    ): Promise<T> {
        // axios config
        const config = {
            method: method.POST,
            url: url,
            body: (options && options.body) || '',
            headers: HttpClient.getHeaders(options),
        };

        const response = await axios(config);
        return (await response.json()) as T;
    }

    static getHeaders(options?: NetworkRequestOptions): Array<string> {
        let headers: Array<string> = new Array<string>();
        if (!(options && options.headers)) {
            return headers;
        }

        options.headers.forEach((val: string, key: string) => {
            headers.push(`${key}: ${val}`);
        });

        console.log(headers);
        return headers;
    }
}
