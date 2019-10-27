const path = require('path');

const express = require('express');
const cors = require('cors');

const getDependents = require('./dataGetter.js').getDependents
const getPackagesInfo = require('./dataGetter.js').getPackagesInfo

const app = express();

app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'))
})

app.get('/index', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'))
})

app.get('/:organisation/:repository', async (req, res, next) => {
  try {
    const organisation = req.params.organisation
    const repository = req.params.organisation

    const packageName = (req.query.package ? req.query.package : null)
    const limit = req.query.limit ? parseInt(req.query.limit) : 100

    let entryUrl = `https://github.com/${organisation}/${repository}/network/dependents`

    // if package name is provided, inserts its ID to github URL as param
    let packagesInfo
    if (packageName) {
      packagesInfo = await getPackagesInfo(entryUrl, packageName)
      let packageId = packagesInfo.packageId
      if (!packageId) {
        throw Error(`Package with name '${packageName}' not found`)
      }
      entryUrl += "?package_id=" + packageId
    }

    let dependents = await getDependents(entryUrl, limit)
    const result = {
      countOfReturnedDependents: dependents.length,
      totalPackages: packagesInfo ? packagesInfo.totalPackagesCount : null,
      entries: dependents
    }

    res.status(200).send(result)
  } catch (err) {
    return next(err);
  }
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on http://localhost:${server.address().port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(
    '500: Internal server error', '500: Internal server error'
  )
});

module.exports = app;
