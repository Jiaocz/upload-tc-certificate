import tencentcloud from 'tencentcloud-sdk-nodejs';
import chalk from 'chalk';

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
    console.log(res)
    return res.DeployedResources[0].Resources;
  } catch (e) {
    console.log(chalk.bgRed.bold('错误：' + e.message));
    process.exit(1);
  }
};

export default { get };
