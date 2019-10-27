const pg = require('pg');

const getGithubPage = require('./getGithubPage.js')
const scrapePage = require('./scrapper.js').scrapePage
const getPackages = require('./scrapper.js').getPackages


// uncomment if you want DB caching, also auncomment and add connection string
//const connectionString = '';
//const client = new pg.Client(connectionString);
//client.connect();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDependents(url, limit, after) {
  let data = await getGithubPage(url).then(response => {
    return scrapePage(response)
  })
  let dependents = []
  if (!after) {
    // uncomment if you want DB caching, also auncomment and add connection string
    //await client.query(`INSERT INTO d_github_urls VALUES ('${url}', DEFAULT, '${JSON.stringify(data.dependents)}')`)
  }
  let nextPage = data.nextPage
  dependents = dependents.concat(data.dependents)
  while (dependents.length < limit && nextPage) {
    data = await getGithubPage(nextPage).then(response => {
      console.log("Got page: " + nextPage)
      return scrapePage(response)
    })
    dependents = dependents.concat(data.dependents)
    // uncomment if you want DB caching, also auncomment and add connection string
    //await client.query(`INSERT INTO d_github_urls VALUES ('${nextPage}', DEFAULT, '${JSON.stringify(data.dependents)}')`)
    nextPage = data.nextPage
    await timeout((Math.floor(Math.random() * 6) + 1) * 1000);
  }
  if (dependents.length > limit) {
    dependents = dependents.slice(0, limit)
  }
  return dependents
}

function getPackagesInfo(url, packageName) {
  return getGithubPage(url).then(response => {
    let packages = getPackages(response)
    for (let i = 0; i < packages.length; i++) {
      if (packages[i].name === packageName) {
        return {
          packageId: packages[i].id,
          totalPackagesCount: packages.length
        }
      }
    }
    return {
      packageId: null,
      totalPackagesCount: packages.length
    }
  })
}

exports.getDependents = getDependents
exports.getPackagesInfo = getPackagesInfo
