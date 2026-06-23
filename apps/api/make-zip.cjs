const archiver = require('archiver')
const { writeFileSync, createWriteStream, existsSync, unlinkSync } = require('fs')
const path = require('path')

writeFileSync('Procfile', 'web: node dist/main.js')

const dest = path.resolve(__dirname, '../../streamline-api.zip')
if (existsSync(dest)) unlinkSync(dest)

const output = createWriteStream(dest)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`✅ streamline-api.zip prêt — ${(archive.pointer() / 1024).toFixed(0)} KB`)
})

archive.on('error', err => { throw err })
archive.pipe(output)

archive.directory('dist/', 'dist')
archive.file('package.json', { name: 'package.json' })
archive.file('Procfile', { name: 'Procfile' })

archive.finalize()
