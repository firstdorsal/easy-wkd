import express from "express";
import { execSync } from "child_process";
import fs from "fs";
const app = express();
const port = 80;
const pkDir = "public-keys";

const parseGPG = a => {
    const b = a.match(/^([\s]{14})([a-z0-9]*)/gm);
    return b ? b[0].replaceAll(" ", "") : false;
};

const keyIds = fs.readdirSync(pkDir, () => {});
keyIds.forEach(keyId => {
    execSync(`gpg -q --import ${pkDir}/${keyId}`);
    const wkdHash = parseGPG(execSync(`gpg --with-wkd-hash --fingerprint ${keyId}`).toString());
    if (!wkdHash) console.log(`key with keyId ${keyId} couldnt be parsed`);
    execSync(`gpg --no-armor --export ${keyId} > public/.well-known/openpgpkey/hu/${wkdHash}`);
    console.log(`imported key for id: ${keyId}`);
    const test = execSync(`gpg -v --auto-key-locate clear,wkd,nodefault --locate-key ${keyId}`).toString();
    console.log("trying to get the key via wkd (proxy/dns/routing has to work for this):");
    console.log(test);
});

app.use(express.static("public"));

app.use((req, res) => {
    res.status(404);
});

app.listen(port, () => console.log(`server started at port ${port}`));
