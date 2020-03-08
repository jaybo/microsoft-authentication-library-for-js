/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringUtils } from "../utils/StringUtils";
import { ClientConfigurationError } from "../error/ClientConfigurationError";

export class RequestValidator {

    // validate scopes

    // validate redirectUri
    static validateRedirectUri(redirectUri: string): void {
        if(StringUtils.isEmpty(redirectUri)) {
            throw ClientConfigurationError.createUrlEmptyError();
        }
    }
}
