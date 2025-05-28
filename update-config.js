const fs = require('fs')
const path = require('path')
const os = require('os')

// Get the username from the system
const username =
  process.env.USER || process.env.USERNAME || os.userInfo().username

// Path to package.json
const packageJsonPath = path.resolve(__dirname, './package.json')

// Read the package.json file
const packageJson = require(packageJsonPath)

// Update the configuration with the username
packageJson.retoolCustomComponentLibraryConfig.name = `${username}Components`
packageJson.retoolCustomComponentLibraryConfig.label = `${username}'s Custom Components`
packageJson.retoolCustomComponentLibraryConfig.description = `A library of ${username}'s custom Retool components`

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log(`Updated configuration with username: ${username}`)
