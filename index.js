let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let crypto = require('crypto')
let nodeifyit = require('nodeifyit')
let flash = require('connect-flash')
let mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/authenticator')
// Will allow crypto.promise.compare(...)
require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()
app.use(morgan('dev'))

app.set('view engine', 'ejs')
app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))
app.get('/', (req, res) => {
    res.render('index.ejs', {})
})

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

app.use(flash())
// Use the passport middleware to enable passport
app.use(passport.initialize())
// Enable passport persistent sessions
app.use(passport.session())

// Add in-memory user before app.listen()
let user = {
    email: 'foo@foo.com',
    password: crypto.pbkdf2Sync('asdf','salt', 4096, 512, 'sha256')
}

//Authentication
passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    // We'll need this later
    failureFlash: true
}, nodeifyit(async (email, password) => {
   if (email !== user.email) {
       return [false, {message: 'Invalid username'}]
   }

   if (user.password !== await crypto.promise.pbkdf2(password,'salt', 4096, 512)) {
       return [false, {message: 'Invalid password'}]
   }
   return user
}, {spread: true})))

//Sign-up
passport.use('local-signup', new LocalStrategy({
   // Use "email" field instead of "username"
   usernameField: 'email'
}, nodeifyit(async (email, password) => {
    email = (email || '').toLowerCase()
    // Is the email taken?
    if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken.'}]
    }
    // create the user
    let user = new User()
    user.email = email
    // Use a password hash instead of plain-text
    user.password = await bcrypt.promise.hash(password, SALT)
    return await user.save()
}, {spread: true})))

passport.serializeUser(function(user, callback) {
    // Use email since id doesn't exist
    callback(null, user.email)
})

//passport.deserializeUser(function(id, callback) {
//    // return the hardcoded user
//    callback(null, user)
//})
passport.deserializeUser(nodeifyit(async (email) => {
    return await User.findOne({email}).exec()
}))

// process the login form
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))
