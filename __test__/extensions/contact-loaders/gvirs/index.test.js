import { when } from "jest-when";
import * as LoaderToTest from "../../../../src/extensions/contact-loaders/gvirs";
import { hasConfig, getConfig } from "../../../../src/server/api/lib/config";
import { GVIRS_CACHE_SECONDS } from "../../../../src/extensions/contact-loaders/gvirs/const";
jest.mock("../../../../src/server/api/lib/config");

describe("gvirs contact loader", () => {
  beforeEach(async () => {});

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it("comes with standard contact loader functionality", async () => {
    // Most action handlers in Spoke have test handlers which are as simple as calling
    // the validateActionHandler function. The validateActionHandler function is basically
    // "Does the handler have this function?" A lot of these tests are doing the same thing.

    expect(LoaderToTest.name).toEqual("gvirs");
    expect(LoaderToTest.displayName()).toEqual("gVIRS");
    expect(LoaderToTest.clientChoiceDataCacheKey({ id: 1 }, null)).toEqual("1");
    expect(
      await LoaderToTest.getClientChoiceData({ id: 1 }, null, null)
    ).toEqual({
      data: "{}",
      expiresSeconds: GVIRS_CACHE_SECONDS
    });
    expect(typeof LoaderToTest.addServerEndpoints).toEqual("function");
    expect(typeof LoaderToTest.available).toEqual("function");
    expect(typeof LoaderToTest.processContactLoad).toEqual("function");
  });

  describe("gvirs contact loader available()", () => {
    afterEach(async () => {
      jest.clearAllMocks();
    });

    it("is available if all mandatory environment variables are available and the org name is available", async () => {
      when(hasConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue(true);
      when(getConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue("defaultorg,url,a,b");
      expect(await LoaderToTest.available({ name: "defaultorg" })).toEqual({
        result: true,
        expiresSeconds: GVIRS_CACHE_SECONDS
      });
    });

    it("is not available if all mandatory environment variables are available but the org name is not", async () => {
      when(hasConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue(true);
      when(getConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue("notdefaultorg,url,a,b");
      expect(await LoaderToTest.available({ name: "defaultorg" })).toEqual({
        result: false,
        expiresSeconds: GVIRS_CACHE_SECONDS
      });
    });

    it("is not available if mandatory environment variables are not available", async () => {
      when(hasConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue(false);
      expect(await LoaderToTest.available({ id: 1 })).toEqual({
        result: false,
        expiresSeconds: GVIRS_CACHE_SECONDS
      });
    });
  });

  describe("gvirs getClientChoiceData()", () => {
    afterEach(async () => {
      jest.clearAllMocks();
    });

    it("passes the organisation name along to the contact loader if the org is available", async () => {
      when(getConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue("defaultorg,url,a,b");
      expect(
        await LoaderToTest.getClientChoiceData(
          { name: "defaultorg" },
          null,
          null
        )
      ).toEqual({
        data: '{"name":"defaultorg"}',
        expiresSeconds: GVIRS_CACHE_SECONDS
      });
    });

    it("is not available if all mandatory environment variables are available but the org name is not", async () => {
      when(getConfig)
        .calledWith("GVIRS_CONNECTIONS")
        .mockReturnValue("notdefaultorg,url,a,b");
      expect(
        await LoaderToTest.getClientChoiceData(
          { name: "defaultorg" },
          null,
          null
        )
      ).toEqual({
        data: "{}",
        expiresSeconds: GVIRS_CACHE_SECONDS
      });
    });
  });
});
