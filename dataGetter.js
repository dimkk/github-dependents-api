const getGithubPage = require('./getGithubPage.js')
const scrapePage = require('./scrapper.js').scrapePage
const getPackages = require('./scrapper.js').getPackages

async function getDependents(url, limit) {
  let data = await getGithubPage(url).then(response => {
    return scrapePage(response)
  })
  let dependents = []
  let nextPage = data.nextPage
  dependents = dependents.concat(data.dependents)
  while (dependents.length < limit && nextPage) {
    data = await getGithubPage(nextPage).then(response => {
      return scrapePage(response)
    })
    dependents = dependents.concat(data.dependents)
    nextPage = data.nextPage
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
