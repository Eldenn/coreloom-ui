// Coreloom UI — initials. The letters an avatar shows when there is no picture: "Ada Lovelace" → "AL".

/** The first letter of the first two words, upper-cased. Extra spaces are ignored. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? '')
    .join('')
}

export { initials }
