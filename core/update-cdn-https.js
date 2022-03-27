import chalk from "chalk";
import tencentcloud from 'tencentcloud-sdk-nodejs';

const update = async (clientConfig, domain, certId) => {
  const CdnClient = tencentcloud.cdn.v20180606.Client;
  const client = new CdnClient(clientConfig);
  const paramsSearch = {
    "Limit": 1,
    "Filters": [{
      "Name": "domain",
      "Value": [domain]
    }]
  };

  try {
    console.log(chalk.greenBright(`Updating ${domain}'s HTTPS setting...`));
    const res = await client.DescribeDomainsConfig(paramsSearch);
    const Https = res.Domains[0].Https;
    Https.CertInfo = { "CertId": certId };
    await client.UpdateDomainConfig({ "Domain": domain, Https });
    console.log(chalk.green('Done'));
  } catch (e) {
    console.log(chalk.bgRed.bold('Error：' + e.message));
  }
}

export default { update };
