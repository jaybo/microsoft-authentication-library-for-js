import { expect } from "chai";
import sinon from "sinon";
import { AuthorizationCodeParameters } from "../../src/request/AuthorizationCodeParameters";
import { AuthorizationCodeUrlParameters } from "../../src/request/AuthorizationCodeUrlParameters";
import { AadAuthority } from "../../src/authority/AadAuthority";
import { Constants, AADServerParamKeys } from "../../src/utils/Constants";
import { NetworkRequestOptions, INetworkModule } from "../../src/network/INetworkModule";
import { TEST_CONFIG, TEST_URIS, RANDOM_TEST_GUID, TEST_DATA_CLIENT_INFO} from "../utils/StringConstants";
import { ICrypto, PkceCodes } from "../../src/crypto/ICrypto";
import { UrlGenerator } from "./../../src/server/UrlGenerator";

describe("UrlGenerator.ts Class Unit Tests", () => {

    let networkInterface: INetworkModule;
    let cryptoInterface: ICrypto;
    let aadAuthority: AadAuthority;
    beforeEach(() => {
        networkInterface = {
            sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            },
            sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            }
        };
        cryptoInterface = {
            createNewGuid(): string {
                return RANDOM_TEST_GUID;
            },
            base64Decode(input: string): string {
                switch (input) {
                    case TEST_DATA_CLIENT_INFO.TEST_RAW_CLIENT_INFO:
                        return TEST_DATA_CLIENT_INFO.TEST_DECODED_CLIENT_INFO;
                    default:
                        return input;
                }
            },
            base64Encode(input: string): string {
                switch (input) {
                    case "123-test-uid":
                        return "MTIzLXRlc3QtdWlk";
                    case "456-test-utid":
                        return "NDU2LXRlc3QtdXRpZA==";
                    default:
                        return input;
                }
            },
            async generatePkceCodes(): Promise<PkceCodes> {
                return {
                    challenge: TEST_CONFIG.TEST_CHALLENGE,
                    verifier: TEST_CONFIG.TEST_VERIFIER
                }
            }
        };
        aadAuthority = new AadAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
    });

    afterEach(() => {
        sinon.restore();
    });

    it.only("tests authorizationCodeUrlBuilder() defaults", () => {
        const request: AuthorizationCodeUrlParameters = {redirectUri: TEST_URIS.TEST_REDIR_URI};

        let codeParams: Map<string, string> = new Map<string, string>();
        UrlGenerator.authorizationCodeUrlBuilder(codeParams, request);

        // expect(codeParams.has(AADServerParamKeys.RESPONSE_MODE), `${AADServerParamKeys.RESPONSE_MODE}`).to.be.true;
        expect(codeParams).to.contain.all.keys(`${AADServerParamKeys.RESPONSE_TYPE}`, `${AADServerParamKeys.RESPONSE_MODE}`);
    });

    it.only("tests authorizationCodeUrlBuilder() with PKCE", () => {
        const request: AuthorizationCodeUrlParameters = {
            redirectUri: TEST_URIS.TEST_REDIR_URI,
            codeChallenge: TEST_CONFIG.TEST_CHALLENGE,
            codeChallengeMethod: TEST_CONFIG.TEST_CHALLENGE_METHOD
        };

        let codeParams: Map<string, string> = new Map<string, string>();
        UrlGenerator.authorizationCodeUrlBuilder(codeParams, request);

        // expect(codeParams.has(AADServerParamKeys.RESPONSE_MODE), `${AADServerParamKeys.RESPONSE_MODE}`).to.be.true;
        expect(codeParams).to.contain.all.keys(
            `${AADServerParamKeys.RESPONSE_TYPE}`,
            `${AADServerParamKeys.RESPONSE_MODE}`,
            `${AADServerParamKeys.CODE_CHALLENGE}`,
            `${AADServerParamKeys.CODE_CHALLENGE_METHOD}`
        );
    });

    it.only("tests authorizationCodeBuilder() defaults", () => {
        const request: AuthorizationCodeParameters = {redirectUri: TEST_URIS.TEST_REDIR_URI, codeVerifier: TEST_CONFIG.TEST_VERIFIER};

        let codeParams: Map<string, string> = new Map<string, string>();
        UrlGenerator.authorizationCodeBuilder(codeParams, request);

        // expect(codeParams.has(AADServerParamKeys.RESPONSE_MODE), `${AADServerParamKeys.RESPONSE_MODE}`).to.be.true;
        expect(codeParams).to.contain.all.keys(
            `${AADServerParamKeys.RESPONSE_TYPE}`,
            `${AADServerParamKeys.CLIENT_INFO}`,
            `${AADServerParamKeys.CODE_VERIFIER}`
        );
    });

    it.only("tests addScopes()", () => {
        const request: AuthorizationCodeUrlParameters = {redirectUri: TEST_URIS.TEST_REDIR_URI};

        let codeParams: Map<string, string> = new Map<string, string>();
        const scopes = TEST_CONFIG.DEFAULT_SCOPES;
        UrlGenerator.addScopes(codeParams, scopes);
        console.log(codeParams.values());

        // expect(codeParams.has(AADServerParamKeys.RESPONSE_MODE), `${AADServerParamKeys.RESPONSE_MODE}`).to.be.true;
        expect(codeParams).to.contain.keys(`${AADServerParamKeys.SCOPE}`);
    });


});
