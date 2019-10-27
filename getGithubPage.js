const request = require('request-promise-cache');

const cacheStaleTimeout = 100; // minutes

function getGithubPage (url) {
  return request({
    url: url,
    cacheKey: url,
    cacheTTL: cacheStaleTimeout * 60 * 1000,
    cacheLimit: 12,
    resolveWithFullResponse: false,
  })
}

module.exports = getGithubPage
