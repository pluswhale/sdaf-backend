export const getStatusCodeByPlatform = (platform: string) => {
  const statusCodes: { [key: string]: number[] } = {
    binance: [4035, 2008],
    ceffu: [4040, 4041],
  };

  return statusCodes[platform] || null;
};
