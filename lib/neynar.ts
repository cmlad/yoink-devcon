import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const client = new NeynarAPIClient(
  process.env.NEYNAR_API_KEY ?? "NEYNAR_API_DOCS",
);

export const getUserByAddress = async (address: string) => {
  try {
    const user = await client.fetchBulkUsersByEthereumAddress([address]);
    const userData = user[address.toLowerCase()];
    if (userData) {
      return userData[0];
    }
  } catch {
    return undefined;
  }
};

type YoinkInput = {
  from: string;
  by: string;
  timestamp: number;
};

type YoinkWithUsername = {
  from: string;
  by: string;
  timestamp: number;
};

export const getYoinksWithUsernames = async (
  yoinks: YoinkInput[],
): Promise<YoinkWithUsername[]> => {
  const uniqueAddresses = [
    ...new Set(yoinks.flatMap((yoink) => [yoink.from, yoink.by])),
  ];

  const users = await client.fetchBulkUsersByEthereumAddress(uniqueAddresses);

  const addressToUsername: Record<string, string> = Object.fromEntries(
    uniqueAddresses.map((address) => {
      const userData = users[address.toLowerCase()];
      const username = userData?.[0]?.username ?? truncateAddress(address);
      return [address, username];
    }),
  );

  return yoinks.map((yoink) => ({
    from: addressToUsername[yoink.from] ?? "Unknown Yoinker",
    by: addressToUsername[yoink.by] ?? "Unknown Yoinker",
    timestamp: yoink.timestamp,
  }));
};

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};
