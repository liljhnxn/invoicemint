import { http, createConfig, injected } from "wagmi";
import { botchainMainnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainMainnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchainMainnet.id]: http(botchainMainnet.rpcUrls.default.http[0]),
  },
  ssr: true,
});
