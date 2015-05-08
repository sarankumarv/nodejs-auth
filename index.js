let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()

app.set('view engine', 'ejs')
app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))
app.get('/', (req, res) => res.render('index.ejs', {}))

