import { http, createConfig, injected } from "wagmi";
import { botchainMainnet, botchainTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainMainnet, botchainTestnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchainMainnet.id]: http(botchainMainnet.rpcUrls.default.http[0]),
    [botchainTestnet.id]: http(botchainTestnet.rpcUrls.default.http[0]),
  },
  ssr: true,
});
