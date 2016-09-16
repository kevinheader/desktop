import * as Fs from 'fs'
import * as Path from 'path'
import * as Url from 'url'

const snakeCase = require('snake-case')

export default class EmojiStore {
  /** Map from shorcut (e.g., :+1:) to on disk URL. */
  public readonly emoji = new Map<string, string>()

  public read(): Promise<void> {
    return new Promise((resolve, reject) => {
      const basePath = process.env.TEST_ENV ? Path.join(__dirname, '..', '..', '..', 'static') : __dirname
      Fs.readFile(Path.join(basePath, 'emoji.json'), 'utf8', (err, data) => {
        const json = JSON.parse(data)
        for (const key in json) {
          const serverURL = json[key]
          const localPath = serverURLToLocalPath(serverURL)

          // For whatever reason, the mapping we get from the API is in camel
          // case, but it really should be in snake case. So convert it.
          this.emoji.set(`:${snakeCase(key)}:`, localPath)
        }

        resolve()
      })
    })
  }
}

function serverURLToLocalPath(url: string): string {
  // url = https://assets-cdn.github.com/images/icons/emoji/unicode/1f44e.png?v6

  const parsedURL = Url.parse(url)

  const path = parsedURL.pathname!
  // path = /images/icons/emoji/unicode/1f44e.png

  const relativePath = path.replace('/images/icons', '')
  // relativePath = /emoji/unicode/1f44e.png

  return `file://${Path.join(__dirname, relativePath)}`
}