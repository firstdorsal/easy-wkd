import express from "express";
import { execSync } from "child_process";
import { promises as fs } from "fs";
const app = express();
const port = 80;
const pkDir = "public-keys";
const regex = new RegExp(/^([\s]{14})([a-z0-9]*)@(.*)/gm); // seperate the openpgp output into domain and wkd name

// create folders
await fs.mkdir(`public/.well-known/openpgpkey/hu/`, { recursive: true }).catch(e => console.log(e));
await fs.mkdir(`public/.well-known/openpgpkey/policy`).catch(e => console.log(e));

const keyIds = await fs.readdir(pkDir);

keyIds.forEach(async keyId => {
    // import the keys
    execSync(`gpg -q --import ${pkDir}/${keyId}`);

    // get the correct hashed names for the keys
    const wkdHash = regex.exec(execSync(`gpg --with-wkd-hash --fingerprint ${keyId}`).toString());
    if (!wkdHash) console.log(`key with keyId ${keyId} couldnt be parsed`);

    // export the keys in the correct format to the right locations
    execSync(`gpg --no-armor --export ${keyId} > public/.well-known/openpgpkey/hu/${wkdHash[2]}`);
    await fs.mkdir(`public/.well-known/openpgpkey/${wkdHash[3]}/hu/`, { recursive: true }).catch(e => console.log(e));
    await fs.copyFile(`public/.well-known/openpgpkey/hu/${wkdHash[2]}`, `public/.well-known/openpgpkey/${wkdHash[3]}/hu/${wkdHash[2]}`);

    console.log(`imported key for id: ${keyId}`);
    console.log("");

    console.log("trying to get the key via wkd (proxy/dns/routing has to work for this):");
    console.log("also check out https://metacode.biz/openpgp/web-key-directory");
    console.log("");
    const test = execSync(`gpg -v --auto-key-locate clear,wkd,nodefault --locate-key ${keyId}`).toString();
    console.log(test);
    console.log("");
});
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.use(express.static("public"));

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => console.log(`server started at port ${port}`));
