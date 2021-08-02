import express from "express";
import { execSync } from "child_process";
import { promises as fs } from "fs";
const app = express();
const port = 80;
const pkDir = "public-keys";
const regex = /^([\s]{14})([a-z0-9]*)@(.*)/gm; // seperate the openpgp output into domain and wkd name

// create folders
await fs.mkdir(`public/.well-known/openpgpkey/hu/`, { recursive: true }).catch(e => console.log(e));
await fs.writeFile(`public/.well-known/openpgpkey/policy`, "").catch(e => console.log(e));

const keyIds = await fs.readdir(pkDir);
keyIds.forEach(async keyId => {
    // import the key
    execSync(`gpg -q --import ${pkDir}/${keyId}`);

    // get the correct hashed names for the key
    const rawWkdHash = execSync(`gpg --with-wkd-hash --fingerprint ${keyId}`).toString();
    const wkdHash = new RegExp(regex).exec(rawWkdHash);
    if (!wkdHash) return console.log(`key with keyId ${keyId} couldnt be parsed`);

    // export the key in the correct format to the right locations
    execSync(`gpg --no-armor --export ${keyId} > public/.well-known/openpgpkey/hu/${wkdHash[2]}`);
    // direct method
    await fs.mkdir(`public/.well-known/openpgpkey/${wkdHash[3]}/hu/`, { recursive: true }).catch(e => console.log(e));

    // advanced method
    await fs.copyFile(`public/.well-known/openpgpkey/hu/${wkdHash[2]}`, `public/.well-known/openpgpkey/${wkdHash[3]}/hu/${wkdHash[2]}`);
    await fs.writeFile(`public/.well-known/openpgpkey/${wkdHash[3]}/policy`, "").catch(e => console.log(e));

    console.log(`imported key for id: ${keyId}`);
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.use(express.static("public"));

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`server started at port ${port}`);
    console.log("");
    console.log("visit https://metacode.biz/openpgp/web-key-directory to check out if everything is working");
    console.log("");
});
