import * as Mocha from "mocha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
const expect = chai.expect;
chai.use(chaiAsPromised);
import sinon from "sinon";
import { AuthorizationCodeFlow } from "../../src/client/AuthorizationCodeFlow";
import { TEST_CONFIG, TEST_URIS, RANDOM_TEST_GUID, DEFAULT_OPENID_CONFIG_RESPONSE, ALTERNATE_OPENID_CONFIG_RESPONSE } from "../utils/StringConstants";
import { AuthorizationCodeUrlParameters } from "../../src/request/AuthorizationCodeUrlParameters";
import { AADServerParamKeys, Constants } from "../../src/utils/Constants";
import { LogLevel } from "../../src/logger/Logger";
import { PublicClientConfiguration } from "../../src/config/PublicClientConfiguration";
import { NetworkRequestOptions } from "../../src/network/INetworkModule";
import { Authority } from "../../src/authority/Authority";
import { PkceCodes } from "../../src/crypto/ICrypto";
import { ClientAuthErrorMessage } from "../../src/error/ClientAuthError";

describe("AuthorizationCodeFlow.ts Class Unit Tests", () => {

    const testLoggerCallback = (level: LogLevel, message: string, containsPii: boolean): void => {
        if (containsPii) {
            console.log(`Log level: ${level} Message: ${message}`);
        }
    }

    let store = {};
    let defaultAuthConfig: PublicClientConfiguration;

    beforeEach(() => {
        defaultAuthConfig = {
            auth: {
                clientId: TEST_CONFIG.MSAL_CLIENT_ID,
                authority: TEST_CONFIG.validAuthority,
                redirectUri: TEST_URIS.TEST_REDIR_URI,
            },
            storageInterface: {
                setItem(key: string, value: string): void {
                    store[key] = value;
                },
                getItem(key: string): string {
                    return store[key];
                },
                removeItem(key: string): void {
                    delete store[key];
                },
                containsKey(key: string): boolean {
                    return !!store[key];
                },
                getKeys(): string[] {
                    return Object.keys(store);
                },
                clear(): void {
                    store = {};
                }
            },
            networkInterface: {
                sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                },
                sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                }
            },
            cryptoInterface: {
                createNewGuid(): string {
                    return RANDOM_TEST_GUID;
                },
                base64Decode(input: string): string {
                    return input;
                },
                base64Encode(input: string): string {
                    return input;
                },
                async generatePkceCodes(): Promise<PkceCodes> {
                    return {
                        challenge: TEST_CONFIG.TEST_CHALLENGE,
                        verifier: TEST_CONFIG.TEST_VERIFIER
                    }
                }
            },
            loggerOptions: {
                loggerCallback: testLoggerCallback
            }
        };
    });

    describe("Constructor", () => {

        it("creates an AuthorizationCodeFlow that extends the Client", () => {
            const client = new AuthorizationCodeFlow(defaultAuthConfig);
            expect(client).to.be.not.null;
            expect(client instanceof AuthorizationCodeFlow).to.be.true;
        });
    });

    describe("Url Creation", () => {

        let Client: AuthorizationCodeFlow;
        beforeEach(() => {
            sinon.stub(Authority.prototype, <any>"discoverEndpoints").resolves(DEFAULT_OPENID_CONFIG_RESPONSE);
            Client = new AuthorizationCodeFlow(defaultAuthConfig);
        });

        afterEach(() => {
            sinon.restore();
            store = {};
        });

        it("Creates a URL with default scopes", async () => {
            const request: AuthorizationCodeUrlParameters = {redirectUri: TEST_URIS.TEST_REDIR_URI};
            const url = await Client.getAuthCodeUrl(request);
            expect(url).to.contain(Constants.DEFAULT_AUTHORITY);
            expect(url).to.contain(DEFAULT_OPENID_CONFIG_RESPONSE.authorization_endpoint.replace("{tenant}", "common"));
            expect(url).to.contain(`${AADServerParamKeys.SCOPE}=${Constants.OPENID_SCOPE}%20${Constants.PROFILE_SCOPE}%20${Constants.OFFLINE_ACCESS_SCOPE}`);
            expect(url).to.contain(`${AADServerParamKeys.RESPONSE_TYPE}=${Constants.CODE_RESPONSE_TYPE}`);
            expect(url).to.contain(`${AADServerParamKeys.CLIENT_ID}=${TEST_CONFIG.MSAL_CLIENT_ID}`);
            expect(url).to.contain(`${AADServerParamKeys.REDIRECT_URI}=${encodeURIComponent(TEST_URIS.TEST_REDIR_URI)}`);
        });

        it("Creates a URL with scopes from given token request", async () => {
            const testScope1 = "testscope1";
            const testScope2 = "testscope2";
            const request: AuthorizationCodeUrlParameters = {
                scopes: [testScope1, testScope2],
                redirectUri: TEST_URIS.TEST_REDIR_URI
            };
            const url = await Client.getAuthCodeUrl(request);
            expect(url).to.contain(`${AADServerParamKeys.SCOPE}=${encodeURIComponent(`${testScope1} ${testScope2} ${Constants.OPENID_SCOPE} ${Constants.PROFILE_SCOPE} ${Constants.OFFLINE_ACCESS_SCOPE}`)}`);
        });

        it("Uses authority if given in request", async () => {
            sinon.restore();
            sinon.stub(Authority.prototype, <any>"discoverEndpoints").resolves(ALTERNATE_OPENID_CONFIG_RESPONSE);
            const request: AuthorizationCodeUrlParameters = {
                authority: `${TEST_URIS.ALTERNATE_INSTANCE}/common`,
                redirectUri: TEST_URIS.TEST_REDIR_URI
            };
            const url = await Client.getAuthCodeUrl(request);
            expect(url).to.contain(TEST_URIS.ALTERNATE_INSTANCE);
            expect(url).to.contain(ALTERNATE_OPENID_CONFIG_RESPONSE.authorization_endpoint);
            expect(url).to.contain(`${AADServerParamKeys.SCOPE}=${encodeURIComponent(`${Constants.OPENID_SCOPE} ${Constants.PROFILE_SCOPE} ${Constants.OFFLINE_ACCESS_SCOPE}`)}`);
            expect(url).to.contain(`${AADServerParamKeys.RESPONSE_TYPE}=${Constants.CODE_RESPONSE_TYPE}`);
            expect(url).to.contain(`${AADServerParamKeys.CLIENT_ID}=${TEST_CONFIG.MSAL_CLIENT_ID}`);
            expect(url).to.contain(`${AADServerParamKeys.REDIRECT_URI}=${encodeURIComponent(TEST_URIS.TEST_REDIR_URI)}`);
        });

        it("Throws endpoint discovery error if resolveEndpointsAsync fails", async () => {
            sinon.restore();
            const exceptionString = "Could not make a network request."
            sinon.stub(Authority.prototype, "resolveEndpointsAsync").throwsException(exceptionString);
            const request: AuthorizationCodeUrlParameters = {redirectUri: TEST_URIS.TEST_REDIR_URI};
            await expect(Client.getAuthCodeUrl(request)).to.be.rejectedWith(`${ClientAuthErrorMessage.endpointResolutionError.desc} Detail: ${exceptionString}`);
        });
    });
});
