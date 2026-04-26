import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";
import { heroCtaVariant } from "../../../../flags";

export const GET = createFlagsDiscoveryEndpoint(async () => getProviderData({ heroCtaVariant }));
