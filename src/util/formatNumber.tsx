export const formatNumber = (num: number) => {
  return num.toLocaleString('en-US', {
    useGrouping: true,
  });
};
