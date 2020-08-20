const pg = require('pg');

const getGithubPage = require('./getGithubPage.js')
const scrapePage = require('./scrapper.js').scrapePage
const getPackages = require('./scrapper.js').getPackages
let dependents = []
let isStopped = false
let lastMessage = ""
async function getCurrentDependents (){
  return new Promise(resolve => resolve(dependents)) 
}

function stop (){
  isStopped = true
  return true
}

function getLastMessage (){
  return lastMessage
}
// config = {
//   user: 'postgres', // default process.env.PGUSER || process.env.USER
//   password: 'postgres', //default process.env.PGPASSWORD
//   host: 'localhost', // default process.env.PGHOST
//   database: 'gh_deps', // default process.env.PGDATABASE || process.env.USER
//   port: 5432 // default process.env.PGPORT
//   //connectionString?: string, // e.g. postgres://user:password@host:5432/database
// }

// uncomment if you want DB caching, also auncomment and add connection string
//const connectionString = '';
// const client = new pg.Client(config);
// client.connect();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDependents(url, limit_old, after, stars) {
  let data = await getGithubPage(url).then(response => {
    return scrapePage(response, stars)
  })
  let limit = 100
  if (data.limit) limit = data.limit
  else limit = limit_old 
  
  if (!after) {
    // uncomment if you want DB caching, also auncomment and add connection string
    //const query = `INSERT INTO d_github_urls VALUES ('${url}', DEFAULT, '${JSON.stringify(data.dependents)}')`
    //await client.query(query)
  }
  let nextPage = data.nextPage
  dependents = data.dependents.concat(dependents)
  while (dependents.length < limit && nextPage && !isStopped) {
    data = await getGithubPage(nextPage).then(response => {
      console.log("Got page: " + nextPage)
      
      return scrapePage(response, stars)
    })
    dependents = data.dependents.concat(dependents)
    lastMessage = `parsed deps - ${dependents.length}, out of ${limit}`
    console.log(lastMessage)
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
exports.getCurrentDependents = getCurrentDependents
exports.stop = stop
exports.getLastMessage = getLastMessage