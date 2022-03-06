let accessToken = "";

export const setAccessToken = (newValue: string) => {
  accessToken = newValue;
};

export const getAccessToken = () => {
  return accessToken;
};
