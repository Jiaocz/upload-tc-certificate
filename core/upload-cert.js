import chalk from 'chalk';
import tencentcloud from 'tencentcloud-sdk-nodejs';

const upload = async (clientConfig, common_name, cert_key, cert_pem) => {
  const SslClient = tencentcloud.ssl.v20191205.Client;
  const client = new SslClient(clientConfig);
  const params = {
    "CertificatePublicKey": cert_pem,
    "CertificatePrivateKey": cert_key,
    "Alias": common_name,
    "CertificateUse": "CDN"
  };

  try {
    let res = await client.UploadCertificate(params);

    if (res?.Error) {
      console.log(chalk.bgRed.bold("Request Error: " + res.Error.Message));
      process.exit(1);
    }

    if(res.CertificateId) {
      return res.CertificateId;
    } else {
      return null;
    }

  } catch (e) {
    console.log(chalk.bgRed.bold('错误：' + e.message));
    process.exit(1);
  }
}

export default { upload };
