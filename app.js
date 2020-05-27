require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");	

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret: 'S3CR3T', saveUninitialized: false, resave: false}));
app.use(passport.initialize()); 
app.use(passport.session());

mongoose.connect("mongodb+srv://adhish22:rocknroll1@cluster0-lsdv1.mongodb.net/rockmechanics", {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = new mongoose.Schema({
  date: String,
  title: String,
  content: String,
  image: Array
});

const Post = mongoose.model("Post", postSchema);

const commentSchema = new mongoose.Schema({
  name: String,
  body: String,
  postId :String
});

const Comments = mongoose.model("Comments", commentSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user){
		done(err, user);
	});
});	

passport.use(new GoogleStrategy({
    clientID: "104082359611-kqakqce5fmajl4i0paeuui3dt7gdnt3k.apps.googleusercontent.com",
    clientSecret: "MAiqY08PCwmvl9HnahglLkYB",
    callbackURL: "http://rockmechanics.net/auth/google/rockmechanics",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));	


app.get("/" , function(req, res){
	res.render("index");
});

app.get("/auth/google",
	passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/rockmechanics",
	passport.authenticate("google", {failureRedirect: "/"}),
	function(req, res){
		res.redirect("/blog");
	});

app.get("/projects", function(req, res){
	res.render("projects");
});

app.get("/blog", function(req, res){

  Post.find({}, function(err, posts){
    res.render("blog", {
      posts: posts
      });
  });
});

app.get("/publications", function(req, res){
  res.render("publications");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

   const post = new Post ({
   date: req.body.date,
   title: req.body.postTitle,
   content: req.body.postBody
   // image: req.body.imgurl
 });

  post.save(function(err){
    if (!err){
        res.redirect("/blog");
    }
  });
});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  console.log(req.params.postId);
  Post.findOne({_id: requestedPostId}, function(err, posts){
     if (err) {
          console.log(err);
        } else {
            Comments.find({"postId":req.params.postId}, function (err, comments) {
                res.render("post", { posts: posts, comments: comments, postId: req.params.postId });
            });
        }
    }); 
});

app.post("/posts/:postId", function(req, res){
  const comment = new Comments({
    name: req.body.userName,
    body: req.body.commentBody,
    postId: req.body.id
  });

 comment.save(function(err){
    if (!err){
        res.redirect("/posts/"+req.params.postId);
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


app.listen(80, function(){
	console.log("Server is running on port 80");
});
