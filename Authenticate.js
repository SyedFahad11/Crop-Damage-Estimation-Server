// Require client library and private key.
var calculateArea = require("./Calculate_area");
var ee = require('@google/earthengine');
var privateKey = require('./geeps-401105-60c9a5d62fd5.json');
async function runAnalysis(districtName) {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log(name);
        ee.initialize(null, null, async function () {
          try {
            const res = await calculateArea(districtName);
            resolve(res);
          } catch (e) {
            console.error('Analysis error: ' + e);
            reject(e);
          }
          // ... run analysis ...
        }, function (e) {
          console.error('Initialization error: ' + e);
          reject(e);
        });
      } catch (e) {
        console.error('Authentication error: ' + e);
        reject(e);
      }
    });
  }

// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function (e) {
    console.error('Authentication error: ' + e);
});

module.exports=runAnalysis;