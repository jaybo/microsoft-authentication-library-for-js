/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AuthorizationCodeParameters } from "./AuthorizationCodeParameters";
import { AuthorizationCodeUrlParameters } from "./AuthorizationCodeUrlParameters";
import { PublicClientConfiguration } from "./../config/PublicClientConfiguration";
import { UrlGenerator } from "./../server/URLGenerator";
import { RequestValidator } from "./../request/RequestValidator";

/**
 * Validates and Generates server consumable params from the "request" objects
 */
export class RequestGenerator {

    /**
     *
     * @param request
     * @param authority
     * @param config
     */
    static generateAuthCodeUrlParams(request: AuthorizationCodeUrlParameters, config: PublicClientConfiguration) {

        const paramsMap: Map<string, string> = new Map<string, string>();

        UrlGenerator.addClientId(paramsMap, config.auth.clientId);

        const scopes = RequestValidator.validateAndGenerateScopes(request.scopes, config.auth.clientId);
        UrlGenerator.addScopes(paramsMap, scopes);

        RequestValidator.validateRedirectUri(request.redirectUri);
        UrlGenerator.addRedirectUri(paramsMap, request.redirectUri);

        if(request.state) {
            UrlGenerator.addState(paramsMap, request.state);
        }

        if(request.prompt) {
            RequestValidator.validatePrompt(request.prompt);
            UrlGenerator.addPrompt(paramsMap, request.prompt);
        }

        if(request.loginHint) {
            UrlGenerator.addLoginHint(paramsMap, request.loginHint);
        }

        if(request.domainHint) {
            UrlGenerator.addDomainHint(paramsMap, request.domainHint);
        }

        if(request.nonce) {
            UrlGenerator.addNonce(paramsMap, request.nonce);
        }

        const correlationId = request.correlationId ? request.correlationId : config.cryptoInterface.createNewGuid();
        UrlGenerator.addCorrelationId(paramsMap, correlationId);

        UrlGenerator.authorizationCodeUrlBuilder(paramsMap, request);

        return paramsMap;
    }

    /**
     *
     * @param request
     * @param config
     */
    static generateAuthCodeParams(request: AuthorizationCodeParameters, config: PublicClientConfiguration) {
        RequestValidator.validateRedirectUri(request.redirectUri);
    }

}
