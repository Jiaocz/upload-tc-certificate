export const buildConfig = (secret_id, secret_key, endpoint = "ssl.tencentcloudapi.com") => {
  return {
    credential: {
      secretId: secret_id,
      secretKey: secret_key,
    },
    region: "",
    profile: {
      httpProfile: {
        endpoint: endpoint,
      },
    },
  }
};
