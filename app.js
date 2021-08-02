require('dotenv').config();
const mongoose=require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require("passport");
const session=require("express-session");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;


const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

// now setting up sessions
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
//initializing passport
app.use(passport.initialize());
app.use(passport.session());
// connecting to database
mongoose.connect("mongodb+srv://new-user:test123@cluster0.pqa3i.mongodb.net/blogWebDB", {
  useNewUrlParser: true
});
mongoose.set('useCreateIndex', true);

const userSchema=new mongoose.Schema({
  firstName:String,
  email:String,
  password:String,
  googleId:String,
  facebookId:String,
  githubId:String,
  instagramId:String
})
// plugins for database Schema
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=mongoose.model("user",userSchema);
// creating strategy for passport
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://secure-depths-46657.herokuapp.com/auth/github/main"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://secure-depths-46657.herokuapp.com/auth/google/main",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id,username:profile.emails[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://secure-depths-46657.herokuapp.com/auth/facebook/main"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/main',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/main');
  });

  app.get('/auth/google',
    passport.authenticate('google', {scope: ['profile']})
);
app.get('/auth/google/main',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/main');
  });

  app.get('/auth/facebook',
    passport.authenticate('facebook'));

  app.get('/auth/facebook/main',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res){
      // Successful authentication, redirect home.
      res.redirect('/main');
    });

app.get("/",function(req,res){
  res.render('index');
});

app.get("/main",function(req,res){
  if (req.isAuthenticated()) {
    res.render('main');
  } else {
    res.redirect("/login");
  }
});

app.get("/login",function(req,res){
  res.render('login');
});


app.get("/signup",function(req,res){
  res.render('signup');
});

// this button needs to be added
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/index");
})

app.listen(process.env.PORT || 3000,function(req,res){
  console.log("Server is up and running at 3000");
});
