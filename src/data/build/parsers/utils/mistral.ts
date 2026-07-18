import { Mistral } from "@mistralai/mistralai";

import { MISTRAL_API_KEY } from "@/env";

export const mistralClient = new Mistral({
  apiKey: MISTRAL_API_KEY,
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1000,
      maxInterval: 10000,
      exponent: 1.5,
      maxElapsedTime: 60000,
    },
    retryConnectionErrors: true,
  },
});
