import { expect } from "chai";
import { StateUtils } from "../../src/utils/StateUtils";
import { RANDOM_TEST_GUID } from "./StringConstants";
import { Constants } from "../../src";

describe("StateUtils.ts Class Unit Tests", () => {

    it("setRequestState() appends random GUID to given state", () => {
        const testState = "testState";
        const requestState = StateUtils.setRequestState(testState, RANDOM_TEST_GUID);
        expect(requestState).to.be.eq(`${RANDOM_TEST_GUID}${Constants.RESOURCE_DELIM}${testState}`);
    });

    it("setRequestState() only creates random GUID", () => {
        const requestState = StateUtils.setRequestState("", RANDOM_TEST_GUID);
        expect(requestState).to.be.eq(`${RANDOM_TEST_GUID}`);
    });

    it("getUserRequestState() returns blank string if serverResponseState is null or empty", () => {
        expect(StateUtils.getUserRequestState("")).to.be.empty;
        expect(StateUtils.getUserRequestState(null)).to.be.empty;
    });

    it("getUserRequestState() returns empty string if no resource delimiter found in state string", () => {
        const testState = "testState";
        const requestState2 = `${testState}`;
        expect(StateUtils.getUserRequestState(requestState2)).to.be.empty;
    });

    it("getUserRequestState() correctly splits the state by the resource delimiter", () => {
        const testState = "testState";
        const requestState = `${RANDOM_TEST_GUID}${Constants.RESOURCE_DELIM}${testState}`;
        expect(StateUtils.getUserRequestState(requestState)).to.be.eq(testState);
    });
});
