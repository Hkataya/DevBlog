//-------------------------------------------------------DEVBLOG @2018--------------------------------------------------------------//





//Requiring Dependicies

var express = require("express");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var moment  = require("moment");
var localStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user.js");
var app = express();
app.locals.moment = require("moment");

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

//connecting to mongodb server

//mongoose.connect("mongodb://localhost:27017/devBlog", { useNewUrlParser: true });

mongoose.connect("mongodb+srv://hasan:kataya@devblog-kcphx.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });

//setting view engine to ejs

app.set("view engine", "ejs");

//searching for stylesheets in the public folder

app.use(express.static(__dirname + "/public"));



//initialize body Parser

app.use(bodyParser.urlencoded({extended:true}));


app.use(require("express-session")({
        secret:"secret", 
    resave:false,
    saveUninitialized: false
        
        }));


//initialize and start passport session
app.use(passport.initialize());
app.use(passport.session());

//using local passport strategy
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



var blogSchema = new mongoose.Schema({
    title:String,summary:String,  image:String, desc:String, created:{type:Date, default:Date.now() }, rank:Number    
    
});


var devblog = mongoose.model("devBlog", blogSchema);

/*
User.register(new User({username:"admin"}), "TqUC4jas", function(err, user){
   if(err)
       console.log(err);
    else
    console.log("sucess");
    
    
});
*/




//routes

app.get("/", function(req, res){


    res.render("index");
    

});



app.get("/blog", function(req, res){
                                                 
   // devblog.find({}, function(err,blogs){
 
 devblog.find({}).sort({created: -1}).exec(function(err,blogs){

       if(err)
        console.log(err);
else        
     res.render("home", {blog:blogs});  
});
    

});



app.get("/blog/article/:id", function(req, res){

devblog.findById(req.params.id, function (err, user) { 
 
 
    if(err)
        console.log(err);
    else
    res.render("article", {user:user});
    
});
});


app.all("/admin/*", isLoggedIn);



app.get("/admin", function(req, res){
 

    res.render("admin");
    
    

});


app.post("/admin", passport.authenticate("local", {successRedirect: "/admin/dashboard", failureRedirect: "/admin"}), function(req, res){
    
    res.redirect("/admin/dashboard");
    
});



app.get("/admin/dashboard", function(req, res){
    


          
        devblog.find({}, function(err, blog){
        
       if(err)
           console.log(err);
        else{
            
        
        res.render("dashboard", {blog:blog});
            
        }
        
    });
        
    });




app.post("/admin/dashboard", function(req, res){
    
   
    
     devblog.create({
        title:req.body.title,summary:req.body.summary,  desc:req.body.desc, image:req.body.file

    });
    
  
res.redirect("/admin/dashboard");


});

    

app.get("/admin/dashboard/new", function(req, res){
    
   res.render("entry", {blog:{}});
    

    
});

app.get("/admin/dashboard/edit/:id", function(req, res){
    
    devblog.findById(req.params.id, function (err, blog) { 
 
    res.render("entry", {blog:blog});
    
});
    
});

app.get("/admin/dashboard/delete/:id", function(req, res){
    
    console.log("this is the deleted post " + req.params.id);
    devblog.deleteOne({ _id :req.params.id}, function(err){
    if(err)
        console.log(err); 
    else 
        res.redirect("/admin/dashboard");
    
    
});
    
});



app.get("/admin/dashboard/article/:id", function(req, res){
    
    console.log(req.params.id);
    
    devblog.findById(req.params.id, function (err, user) {
        if(err)
            console.log(err);
        else{
            console.log(user);
         res.render("adminarticle", {user:user});
            
        }
    
    
});
    
    
});
   
    

    app.post("/admin/dashboard/article/:id", function(req, res){
        
    devblog.findByIdAndUpdate(req.params.id, {title:req.body.title, desc:req.body.desc, summary:req.body.summary, image:req.body.file}, function(err,newBlog){
      if(err)
          console.log(err);
        else
            res.redirect("/admin/dashboard/article/"+req.params.id);
        
        
    });
});




app.get('/secret', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
});





function isLoggedIn(req, res, next){


    if(req.isAuthenticated()){return next();}
res.redirect("/admin");

}





app.listen(process.env.PORT || 3000,  function(){
    
    console.log("server has started");
    
});
