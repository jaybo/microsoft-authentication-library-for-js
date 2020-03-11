/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { PublicClientConfiguration, buildPublicClientConfiguration } from "./../config/PublicClientConfiguration";
import { AuthorizationCodeUrlParameters } from "./../request/AuthorizationCodeUrlParameters";
import { Logger } from "./../logger/Logger";
import { AuthorityFactory } from "./../authority/AuthorityFactory";
import { Authority } from "./../authority/Authority";
import { ICrypto } from "./../crypto/ICrypto";
import { ICacheStorage } from "./../cache/ICacheStorage";
import { CacheHelpers } from "./../cache/CacheHelpers";
import { INetworkModule } from "./../network/INetworkModule";
import { Constants } from "./../utils/Constants";
import { RequestGenerator } from "../request/RequestGenerator";
import { ClientAuthError } from "./../error/ClientAuthError";
import { UrlGenerator } from "./../server/URLGenerator";
import { AuthorizationCodeParameters } from "./../request/AuthorizationCodeParameters";
import { TokenResponse }  from "./../response/TokenResponse";

/**
 *
 * AuthorizationCodeFlow class
 *
 * Object instance which will construct requests to send to and handle responses
 * from the Microsoft STS using the authorization code flow.
 */
export class AuthorizationCodeFlow {

    // Application config
    private config: PublicClientConfiguration;

    // Logger object
    public logger: Logger;

    // Crypto Interface
    protected cryptoObj: ICrypto;

    // Storage Interface
    protected cacheStorage: ICacheStorage;

    // Network Interface
    protected networkClient: INetworkModule;

    // Helper API object for running cache functions
    protected cacheManager: CacheHelpers;

    // Account object
    protected account: Account;

    // Default authority object
    protected defaultAuthorityInstance: Authority;

    constructor(configuration: PublicClientConfiguration) {

        // Set the configuration
        this.config = buildPublicClientConfiguration(configuration);

        // Initialize the logger
        this.logger = new Logger(this.config.loggerOptions);

        // Initialize crypto
        this.cryptoObj = this.config.cryptoInterface;

        // Initialize storage interface
        this.cacheStorage = this.config.storageInterface;

        // Initialize storage helper object
        this.cacheManager = new CacheHelpers(this.cacheStorage);

        // Set the network interface
        this.networkClient = this.config.networkInterface;

        // Initialize default authority instance
        this.defaultAuthorityInstance = AuthorityFactory.createInstance(this.config.auth.authority || Constants.DEFAULT_AUTHORITY, this.networkClient);
    }

    /**
     * Creates a url for logging in a user. This will by default add scopes: openid, profile and offline_access. Also performs validation of the request parameters.
     * Including any SSO parameters (account, sid, login_hint) will short circuit the authentication and allow you to retrieve a code without interaction.
     * @param request
     */
    async getAuthCodeUrl(request: AuthorizationCodeUrlParameters): Promise<string> {

        const authority: Authority = await this.setAuthority(request && request.authority);
        const urlMap: Map<string, string> = RequestGenerator.generateAuthCodeUrlParams(request, this.config);
        const url: string = UrlGenerator.createUrl(urlMap,  authority);

        return url;
    }

    /*
    public async acquireTokenByCode(request: AuthorizationCodeParameters, codeVerifier: string): Promise<TokenResponse> {

        const authority: Authority = await this.setAuthority(request && request.authority);
        const urlMap: Map<string, string> = RequestGenerator.generateAuthCodeUrlParams(request, this.config);
        const url: string = UrlGenerator.createUrl(urlMap,  authority);

        return url;
    }
    */

    private async setAuthority(authority: string): Promise<Authority> {
        // Initialize authority or use default, and perform discovery endpoint check.
        const acquireTokenAuthority = (authority) ? AuthorityFactory.createInstance(authority, this.networkClient) : this.defaultAuthorityInstance;

        try {
            await acquireTokenAuthority.resolveEndpointsAsync();
        } catch (e) {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError(e);
        }

        return acquireTokenAuthority;
    }

}
