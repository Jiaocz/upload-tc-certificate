#!/usr/bin/env node
import chalk from "chalk";
import inquirer from 'inquirer';
import { buildConfig } from "./core/client-config.js";
import { readFile } from 'fs/promises';

if(process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv[2] === 'help') {
    console.log(chalk.bgGreen.white('Command Help:'));
    console.log("  " + chalk.underline.red("npm run do") + chalk.red(" cert_path key_path common_name secret_id secret_key"));
    console.log("Or");
    console.log("  " + chalk.underline.red("node index.js") + chalk.red(" cert_path key_path common_name secret_id secret_key"));
    console.log(chalk.bgGreen.white('\nNote before you use: '));
    console.log('  ' + chalk.italic('common_name') + ' must be unique for every cert, including those already on the tencent cloud (alias),' + chalk.underline.red(' otherwise the cert may conflict to other existing cert, and CDN HTTPS configuration may be broken.\n'));
    console.log('  If this is the first time you run and upload, you need to configure your CDN HTTPS after uploading, and for the next time it will automatically update.(Note Ⅱ: You will be prompted if the cert is new one)\n');
    console.log('  Certificate with the same ' + chalk.italic('common_name') + ' will be replaced by the new one.\n');
    process.exit(0);
}

// npm run do cert_path key_path common_name secret_id secret_key
if(process.argv.length < 7) {
    console.log(chalk.bold.red("Usage:"));
    console.log("  " + chalk.bgRed.bold("npm run do") + chalk.red(" cert_path key_path common_name secret_id secret_key"));
    console.log(chalk.red("Or"));
    console.log("  " + chalk.bgRed.bold("node index.js") + chalk.red(" cert_path key_path common_name secret_id secret_key"));
    process.exit(1);
}

// Environment variables
const cert_path = process.argv[2];
const key_path = process.argv[3];
const common_name = process.argv[4];
const secret_id = process.argv[5];
const secret_key = process.argv[6];
const sslClientConfig = buildConfig(secret_id, secret_key);
const cdnClientConfig = buildConfig(secret_id, secret_key, "cdn.tencentcloudapi.com");

// 获取旧证书ID
console.log(chalk.italic.bold.green("Getting previous cert ID..."));
import getOldCertId from "./core/get-old-cert-id.js";
const certId = await getOldCertId.search(sslClientConfig, common_name);
if(certId == null) {
    console.log(chalk.bold.red("No cert found!"));
    let answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'ifNew',
        message: 'Is this a new process? We doesn\'t find the previous cert',
        default: false,
    }])
    if(!answer.ifNew) {
        console.log(chalk.bold.red("Please check your params."));
        console.log();
        process.exit(1);
    }
}
console.log(`Previous cert ID: ${certId}`);

// 获取旧证书绑定服务
console.log(chalk.italic.green("\nGetting CDN Domains which is previously bind the certificate..."));
import getOldCertBind from "./core/get-binding-cdn.js";
let services;
if(certId === null) {
    console.log(chalk.underline.green("Since no previous cert found, skip this step..."));
} else {
    services = await getOldCertBind.get(sslClientConfig, certId);
    if(services.length == 0) {
        console.log(chalk.underline('Seems no CDN service is found. Please manully add the cert to CDN service.'));
    } else {
        console.log(chalk.greenBright('Found ' + services.length + ' CDN service(s):'));
        services.forEach(service => {
            console.log(' - ' + service);
        });
    }
}
console.log();

// 上传新证书
console.log(chalk.italic.green("\nUploading your new certificate..."));
const cert_key = await readFile(key_path);
const cert_pem = await readFile(cert_path);
import uploadCert from "./core/upload-cert.js";
const newCertId = await uploadCert.upload(sslClientConfig, common_name, cert_key.toString(), cert_pem.toString());
if(newCertId === null) {
    console.log(chalk.bgRed.bold('Upload Error: No certificate Id returned. Please check if your cert files are right.'));
    process.exit(1);
}
console.log(`New cert ID: ${newCertId}`);

// 修改服务绑定证书
console.log(chalk.italic.green("\nUpdating CDN service HTTPS setting..."));
import updateCdnConfig from './core/update-cdn-https.js'
if(certId === null) {
    console.log(chalk.underline.green("Since no previous cert found, skip this step..."));
    console.log(chalk.green('Please manually add the cert to CDN service. We will try to update the cert next time you run.'));
} else {
    for(let i = 0; i < services.length; i++) {
        await updateCdnConfig.update(cdnClientConfig, services[i], newCertId);
    }
}

// 删除旧证书
console.log(chalk.italic.green("\nRemoving old certificate..."));
import removeCert from "./core/remove-cert.js";
if(certId === null) {
    console.log(chalk.underline.green("Since no previous cert found, skip this step..."));
} else {
    const removeResult = await removeCert.removeCert(sslClientConfig, certId);
    if(removeResult) {
        console.log(chalk.greenBright('Successfully removed old cert.'));
    } else {
        console.log(chalk.redBright('Failed to remove old cert. Please remove it manully. Cert ID: ' + certId));
    }
}
