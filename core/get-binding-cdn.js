import tencentcloud from 'tencentcloud-sdk-nodejs';

const get = async (clientConfig, cert_id) => {
  const SslClient = tencentcloud.ssl.v20191205.Client;
  const client = new SslClient(clientConfig);
  const param = {
    "CertificateIds": [cert_id],
    "ResourceType": "cdn",
  };

  try {
    let res = await client.DescribeDeployedResources(param);

    if (res?.Error) {
      console.log(chalk.bgRed.bold("Request Error: " + res.Error.Message));
      process.exit(1);
    }

    return res.DeployedResources[0].ResourceIds;
  } catch (e) {
    console.log(chalk.bgRed.bold('错误：' + e.message));
    process.exit(1);
  }
};

export default { get };
