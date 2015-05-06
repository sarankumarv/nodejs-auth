let express = require('express')
let morgan = require('morgan')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()

app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))