const https = require('https');
const fs = require('fs');

const prefix = 'https://api.github.com/repos/';
const postfix = '/releases/latest';

let inputJSON = fs.readFileSync('GorillaTagMods.json');
let modList = JSON.parse(inputJSON);
let result = []

modList.mods.forEach(mod => 
  https.get(`${prefix}${mod.gitPath}${postfix}`, { headers: { 'User-Agent' : 'PixelDevelops/unity-mod-manager' ,'Authorization': `Token ${process.env.UPDATE_MODS_TOKEN}`}},(res) => {
    let body = "";

      res.on("data", (chunk) => {
          body += chunk;
      });

      res.on("end", () => {
          try {
            let json = JSON.parse(body);
            result.push({
              'modName': mod.modName,
              'modAuthor': mod.modAuthor,
              'modVersion': json.tag_name.replace(/[^\d\n,.]/g,''),
              'modGroup': mod.modGroup,
              'modGitPath': mod.modGitPath,
              'modInfoUrl': mod.modInfoUrl,
              'modDownloadUrl': mod.modDownloadUrl,
              'modInstallLocation': mod.modInstallLocation,
              'modDependencies': mod.modDependencies
            });
          } catch (error) {
              console.error(error.message);
          };
    });
}));

let attempts = 0;
let timeout = 20;
let interval = setInterval(() => {
  if (result.length === modList.mods.length || attempts > timeout) {

    result.sort(function(a,b) {
      if (a.name === b.name) return 0;
      return (a.name > b.name) ? 1 : -1;
    });

    fs.writeFileSync('modinfo.json', JSON.stringify(result, null, 2));

    clearInterval(interval);
  } else {
    attempts++;
  }
}, 100);
