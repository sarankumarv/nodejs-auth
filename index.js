let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let user = {
	email:'foo@foo.com',
	password:'asdf'
}

let app = express()

app.set('view engine', 'ejs')
app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))
app.get('/', (req, res) => res.render('index.ejs', {}))

// Read cookies, required for sessions
app.use(cookieParser('ilovethenodejs'))            

// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// In-memory session support, required by passport.session()
app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true
}))

// Use the passport middleware to enable passport
app.use(passport.initialize())
// Enable passport persistent sessions
app.use(passport.session())

passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email'
}, (email, password, callback) => {
    // Don't bother with async/await since code here is simple
    email = (email || '').toLowerCase()
    if (email !== user.email) {
        return callback(null, false, {message: 'Invalid username'})
    } else if (password !== user.password) {
        return callback(null, false, {message: 'Invalid password'})
    }
    callback(null, user)
}))

passport.serializeUser(function(user, callback) {
    // Use email since id doesn't exist
    callback(null, user.email)
})

passport.deserializeUser(function(id, callback) {
    // return the hardcoded user
    callback(null, user)
})

// process the login form
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))
