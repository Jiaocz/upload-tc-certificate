import chalk from "chalk";
import tencentcloud, { cat } from 'tencentcloud-sdk-nodejs';

export const removeCert = async (clientConfig, certId) => {
    const sslClient = tencentcloud.ssl.v20191205.Client;
    const client = new sslClient(clientConfig);
    const params = {
        "CertificateId": certId
    };

    try {
        let res = await client.DeleteCertificate(params);
        return res.DeleteResult;
    } catch (e) {
        console.log(chalk.bgRed.bold(e.message));
        return false;
    }
}

export default { removeCert };
