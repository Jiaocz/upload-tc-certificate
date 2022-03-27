import chalk from "chalk";
import tencentcloud from "tencentcloud-sdk-nodejs";

const search = async (clientConfig, common_name) => {
  const SslClient = tencentcloud.ssl.v20191205.Client;
  const client = new SslClient(clientConfig);
  const params = {
    "Limit": 1,
    "SearchKey": common_name,
    "FilterSource": "upload",
  }

  try {
    const res = await client.DescribeCertificates(params);

    if (res?.Error) {
      console.log(chalk.bgRed.bold("Request Error: " + res.Error.Message));
      process.exit(1);
    }

    const { Certificates } = res;
    if (Certificates && Certificates[0].Alias === common_name) {
      return Certificates[0].CertificateId;
    }
    else return null;
  } catch (e) {
    console.log(chalk.bgRed.bold('错误：' + e.message));
    process.exit(1);
  }
}

export default { search };
