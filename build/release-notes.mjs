// Prints the CHANGELOG section for a version tag, after checking package.json has that version.
// Usage: node build/release-notes.mjs v0.6.0   (exits 1 with a message when something doesn't match)
import fs from 'node:fs'

const tag = process.argv[2] ?? ''
const version = tag.replace(/^v/, '')
const fail = (message) => {
  console.error(message)
  process.exit(1)
}

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version))
  fail(`"${tag}" is not a version tag (expected v1.2.3).`)

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
if (pkg.version !== version)
  fail(`package.json is at ${pkg.version}, the tag is ${tag}. Bump the version first.`)

const changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const heading = new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\][^\\n]*\\n`, 'm')
const start = changelog.search(heading)
if (start === -1) fail(`CHANGELOG.md has no "## [${version}]" section.`)

const body = changelog.slice(start).replace(heading, '')
const end = body.search(/^## \[|^\[[^\]]+\]: /m)
const notes = (end === -1 ? body : body.slice(0, end)).trim()
if (!notes) fail(`The CHANGELOG section for ${version} is empty.`)

console.log(notes)
console.log(
  `\n**Pin this release** in \`components.json\`:\n\n\`\`\`json\n"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/${tag}/{name}.json" }\n\`\`\``,
)
