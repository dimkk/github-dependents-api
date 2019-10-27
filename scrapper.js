const cheerio = require('cheerio');

function scrapePage(response) {
  const $ = cheerio.load(response)
  const $dependants = $('#dependents')

  // get next and prev page URLs
  const paginationBtns = $dependants.find(".paginate-container").find(".BtnGroup").find("a")
  let previousPageUrl
  let nextPageUrl
  if (paginationBtns.length == 0) {
    previousPageUrl = null
    nextPageUrl = null
  } else if (paginationBtns.length == 1) {
    if (paginationBtns.get(0).firstChild.data.trim() == "Previous") {
      previousPageUrl = paginationBtns.get(0).attribs.href
      nextPageUrl = null
    } else {
      previousPageUrl = null
      nextPageUrl = paginationBtns.get(0).attribs.href
    }
  } else {
    if (paginationBtns.get(0).firstChild.data.trim() == "Previous") {
      previousPageUrl = paginationBtns.get(0).attribs.href
      nextPageUrl = paginationBtns.get(1).attribs.href
    } else {
      previousPageUrl = paginationBtns.get(1).attribs.href
      nextPageUrl = paginationBtns.get(0).attribs.href
    }
  }

  // get dependents
  const numberOfDependentsOnPage = $dependants.find(".Box-row.d-flex.flex-items-center").length
  let dependents = []
  $dependants.find(".Box-row.d-flex.flex-items-center").map((index, elem) => {
    let repo = $('[data-hovercard-type=repository]', elem)[0].firstChild.data
    let org = $('[data-hovercard-type=user],[data-hovercard-type=organization]', elem)[0].firstChild.data
    let avatarImage = $('img.avatar', elem)[0].attribs.src
    let stars = parseInt($('svg.octicon-star', elem)[0].nextSibling.data.trim())
    let forks = parseInt($('svg.octicon-repo-forked', elem)[0].nextSibling.data.trim())
    let isGhost = $('[alt="@ghost"]', elem).length > 0
    dependents.push({
      isGhost: isGhost,
      avatarImage: avatarImage,
      org: org,
      repo: repo,
      stars: stars,
      forks: forks,
      fullUrl: `https://github.com/${org}/${repo}`
    })
  })

  return {
    prevPage: previousPageUrl,
    nextPage: nextPageUrl,
    dependents: dependents,
    count: numberOfDependentsOnPage
  }
}

function getPackages(response) {
  const $ = cheerio.load(response)
  const $dependants = $('#dependents')
  const packages = $dependants.find(".select-menu-list").find("a")
  return packages.map((index, entry) => {
    return {
      name: entry.children[3].firstChild.data.trim(),
      id: new RegExp(/.*\?package_id=(.*)/g).exec(entry.attribs.href)[1]
    }
  })
}

exports.scrapePage = scrapePage
exports.getPackages = getPackages
