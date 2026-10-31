// Prints the CHANGELOG section for a version tag, after checking package.json has that version.
// The Release workflow uses it as the GitHub release's notes.
// Usage: node build/release-notes.mjs v0.8.0   (exits 1 with a message when something doesn't match)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** The release notes for `tag`. Throws when the tag, package.json and CHANGELOG disagree. */
export function releaseNotes({ tag, packageVersion, changelog }) {
  const version = tag.replace(/^v/, '')
  if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version))
    throw new Error(`"${tag}" is not a version tag (expected v1.2.3).`)
  if (packageVersion !== version)
    throw new Error(
      `package.json is at ${packageVersion}, the tag is ${tag}. Bump the version first.`,
    )

  const heading = new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\][^\\n]*\\n`, 'm')
  const start = changelog.search(heading)
  if (start === -1) throw new Error(`CHANGELOG.md has no "## [${version}]" section.`)

  const body = changelog.slice(start).replace(heading, '')
  const end = body.search(/^## \[|^\[[^\]]+\]: /m)
  const notes = (end === -1 ? body : body.slice(0, end)).trim()
  if (!notes) throw new Error(`The CHANGELOG section for ${version} is empty.`)

  return `${notes}\n\n**Pin this release** in \`components.json\`:\n\n\`\`\`json\n"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/${tag}/{name}.json" }\n\`\`\``
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    console.log(
      releaseNotes({
        tag: process.argv[2] ?? '',
        packageVersion: pkg.version,
        changelog: fs.readFileSync('CHANGELOG.md', 'utf8'),
      }),
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
