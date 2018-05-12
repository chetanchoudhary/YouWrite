var app = angular.module("youWriteApp", ["firebase", "ui.router", "ngToast", "textAngular"]);



 app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.hashPrefix(''); 

    
    $stateProvider
        .state('home',{
                url : '/',
            templateUrl : 'templates/home.html',
            controller : "HomeCtrl"
   })
      .state('allBlogs',{
                url : '/allBlogs',
            templateUrl : 'templates/allBlogs.html',
            controller : "AllBlogsCtrl"
   })
     
     .state('signup',{
                url : '/signup',
            templateUrl : 'templates/signup.html',
            controller : "SignupCtrl"
   })
      .state('updateProfile',{
                url : '/updateProfile',
            templateUrl : 'templates/updateProfile.html',
            controller : "UpdateProfileCtrl"
   })
     
      .state('createBlogs',{
                url : '/createBlogs',
            templateUrl : 'templates/createBlogs.html',
            controller : "CreateBlogsCtrl"
   })
      .state('createQuotes',{
                url : '/createQuotes',
            templateUrl : 'templates/createQuotes.html',
            controller : "CreateQuotesCtrl"
   })
      .state('createStories',{
                url : '/createStories',
            templateUrl : 'templates/createStories.html',
            controller : "CreateStoriesCtrl"
   })
     
        .state('myBlogs',{
                url : '/myBlogs',
            templateUrl : 'templates/myblogs.html',
            controller : "MyBlogsCtrl"
        })
     
     .state('viewBlogs',{
                url : '/viewBlogs/:id',
            templateUrl : 'templates/viewBlogs.html',
            controller : "ViewBlogsCtrl"
        })
     
      .state('editBlogs',{
                url : '/editBlogs/:id',
            templateUrl : 'templates/editBlogs.html',
            controller : "EditBlogsCtrl"
        })
     
      .state('about',{
                url : '/about',
            templateUrl : 'templates/about.html',
            controller : "AboutCtrl"
   })
      .state('contact',{
                url : '/contact',
            templateUrl : 'templates/contact.html',
            controller : "ContactCtrl"
   })
    
     
        .state('login',{
                url : '/login',
            templateUrl : 'templates/login.html',
            controller : "LoginCtrl"
   });
     
     $urlRouterProvider.otherwise("/");
   
});



app.filter('htmlToPlainText', function(){
    return function(text){
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
})


 app.controller("HomeCtrl", function($scope, $state, $firebaseAuth, $timeout, ngToast, $interval){
     
            
        var auto = $interval(function() {
       
      }, 1000);

     
    var data = [];
    var key= [];

       var user = firebase.auth().currentUser;
        
          
             var database = firebase.database();
               var ref = database.ref('blogs');
            
                                 ref.on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    key.push(childSnapshot.key);
                    data.push(childSnapshot.val());
                   
                });
                      
                                
                   
                    
          
                    });
         
     
    
    
     $scope.myBlogs = data; 
    
          $scope.myBlogs.key = key;
                console.log($scope.myBlogs);
               console.log($scope.myBlogs.key);
                              
    
 })



app.controller("AllBlogsCtrl", function($scope, $state, $firebaseAuth, $timeout, ngToast){
     
     
     
    var data = [];
    var key= [];

       var user = firebase.auth().currentUser;
        
          
             var database = firebase.database();
               var ref = database.ref('blogs');
            
                                 ref.on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    key.push(childSnapshot.key);
                    data.push(childSnapshot.val());
                   
                })
                      
            })
    
        $timeout(function(){
          $scope.myBlogs = data;   
          $scope.myBlogs.key = key;
                console.log($scope.myBlogs);
               console.log($scope.myBlogs.key);
                         
                            });   
              

                               
              

       
     
     
    
 })

app.controller("LoginCtrl", function($scope, $firebaseAuth, $state, $timeout, $rootScope, ngToast){
    
    $scope.googleLogin = function(){
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
        }, function(err){
            console.log(err);
        })
    }
    
     $scope.facebookLogin = function(){
        var provider = new firebase.auth.FacebookAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            
           $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
            
        }, function(err){
            console.log(err);
        })
    }
     
     $scope.twitterLogin = function(){
        var provider = new firebase.auth.TwitterAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            
           $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
            
        }, function(err){
            console.log(err);
        })
    }
     
     
     $scope.emailLogin = function(){
         
         var username = $scope.user.email;
         var password = $scope.user.password;
         
         var auth = $firebaseAuth();
         auth.$signInWithEmailAndPassword(username, password)
         
         .then(function(res){
             console.log(res);
              $rootScope.loggedIn = true;
           $timeout(function(){
                    $state.go( "home" );
                        });
            
             
             $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                   var user = firebase.auth().currentUser;
var name;

if (user != null) {
  name = user.displayName;
 }
                  $rootScope.displayName = name;
             console.log(name);
             
         }, function(err){
             console.log(err);
              $timeout(function(){
                         ngToast.create("Login failed !");
                            });
         })
     }
    
 })

app.controller("MainCtrl", function($scope, $firebaseAuth, ngToast, $state, $timeout, $rootScope){
    
     $scope.logout = function(){
            console.log("logout called");
         var auth = $firebaseAuth();   
         
         auth.$signOut()
         
         
         .then(function(res){
                console.log(res);
                console.log("logged out");
                $timeout(function(){
                         ngToast.create("You have been Logged out !");
                            });
                $timeout(function(){
                    $rootScope.loggedIn = false;
                })
               $timeout(function(){
                    $state.go("home");
                })
            }, function(err){
             console.log(err);
         })
        }
    
})

app.controller("SignupCtrl", function($scope, $firebaseAuth, $state, $timeout, $rootScope, ngToast){
    
    
    

    
     $scope.newUser ={};
        $scope.signup = function(){
            
           
            if($scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
                console.log("All fields are valid");
                if($scope.newUser.password == $scope.newUser.confirmPassword){
                    console.log("all good")
                   
                    //firebase code here
                    var email = $scope.newUser.email;
                    var password = $scope.newUser.password;
                    var auth = $firebaseAuth();
                    auth.$createUserWithEmailAndPassword(email, password)
                    
                    .then(function(response){
                  
                        
                        console.log(response);
                        $timeout(function(){
                         ngToast.create("Your Account has been created !");
                            });
                        $rootScope.loggedIn = true;
                        
                        $timeout(function(){
                         $state.go("updateProfile");
                        });
                        
                    }, function(error){
                        console.log(error);
                        $timeout(function(){
                         ngToast.create("Email Already Exists");
                            });
                    }
                         );
                }
                else{
                    console.log("password dont match");
                    $timeout(function(){
                         ngToast.create("Passwords do not match ! Try Again");
                            });
                }
            }
            
            else{
                console.log("some fields are invalid")
                $timeout(function(){
                         ngToast.create("Enter Information Correctly");
                            });
            }


        
 

        
        }
    

    
    
    
    
    
    
    
    
    <!-- social login  -->
    
     $scope.googleLogin = function(){
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
        }, function(err){
            console.log(err);
        })
    }
    
     $scope.facebookLogin = function(){
        var provider = new firebase.auth.FacebookAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            
           $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
            
        }, function(err){
            console.log(err);
        })
    }
     
     $scope.twitterLogin = function(){
        var provider = new firebase.auth.TwitterAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
        .then(function(res){
            console.log(res);
            
           $rootScope.loggedIn = true;
            $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = res.additionalUserInfo.profile.name;
                    $timeout(function(){
                    $state.go( "home" );
                        });
            
        }, function(err){
            console.log(err);
        })
    }
     
    
    
    
    <!-- social login end -->
    
    
    
    
    
 })


app.controller("UpdateProfileCtrl", function($scope, $rootScope, $state, $timeout, ngToast, $firebaseAuth){
    
    $scope.updateProfile = function(){
         var fullName =$scope.newUser.firstName + " " + $scope.newUser.lastName;
        var contact  = $scope.phoneNumber;
        
        var user = firebase.auth().currentUser;

user.updateProfile({
  displayName: fullName,
  phoneNumber: contact
}).then(function(res) {
  
        console.log("succesful update");
    console.log(res);
    
        

if (user != null) {
  var name = user.displayName;
  }
     $rootScope.displayName = name;
    
    
}, function(err){
  console.log("error");
});
    
    
    $timeout(function(){
                         ngToast.create("Profile Updated!");
                            });
                        $rootScope.loggedIn = true;
                        
                        $timeout(function(){
                         $state.go("home");
                        });

        
        
        }
    
    
    
    
})



 app.controller("CreateBlogsCtrl", function($scope, taOptions, ngToast, $state, $timeout, $firebaseAuth){
     
     
     
     $scope.newBlog = {};
    
    
     taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];
     
     
       $scope.create = function(){
       var user = firebase.auth().currentUser;
           if (user) {
               
                var userId = user.uid;
               var author = user.displayName;
            // Get a reference to the database service
               var database = firebase.database();
              
            database.ref('blogs/').push({
                 author: author,
                uid: userId,
                body: $scope.newBlog.content,
                title: $scope.newBlog.title,
                subHeading: $scope.newBlog.subHeading,
                headerImage: $scope.newBlog.headerImage,
                starCount: 0,
  })
               .then(function(response){
                 
                console.log(response);
                $timeout(function(){
                ngToast.create("Blog Created Successfully");    
                })
                    $timeout(function(){
                $state.go("myBlogs");    
                })
                
            }, function(error){
                $timeout(function(){
                ngToast.create("An error has occured while writing, Please try again later.");  
                   })

                 console.log(error);
           });
               
               
                     
               
           }
              
              
                     
           else{
               $timeout(function(){
                ngToast.create("You are not Logged in");    
                })
                $timeout(function(){
                $state.go("login");    
                })
           }
       
       }
           
     })

app.controller("MyBlogsCtrl", function($scope, $state, $firebaseAuth, $timeout, ngToast){
        
     
    
    var data = [];
    var key= [];

       var user = firebase.auth().currentUser;
           if (user) {
               var userId = firebase.auth().currentUser.uid;
             var database = firebase.database();
               var ref = database.ref('blogs').orderByChild('uid').equalTo(userId);
            
                                 ref.on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    key.push(childSnapshot.key);
                    data.push(childSnapshot.val());
                   
                })
                      
                                
                   
                    
          
                    })
          $scope.myBlogs = data;   
          $scope.myBlogs.key = key;
                console.log($scope.myBlogs);
               console.log($scope.myBlogs.key);
                         
                               
              
}
       
       
           
               
                     
               
           
              
              
                     
           else{
              $state.go("login");
              
           }
  
       });
        
            
app.controller("ViewBlogsCtrl", function($scope, $stateParams,$timeout, $state, ngToast, $rootScope){

    $scope.blog={};

    var data = [];

    var key= [];
    
             var database = firebase.database();
               var ref = database.ref('blogs/').orderByChild('title').equalTo($stateParams.id);
            
                                        ref.on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    key.push(childSnapshot.key);
                    data.push(childSnapshot.val());
                   
                })
                      
                     
                    
          
                    })
                  
                   
        $scope.blog = data;
             
              console.log($scope.blog);
         
                         
})


app.controller("CreateQuotesCtrl", function($scope){
    
 })

app.controller("CreateStoriesCtrl", function($scope){
    
 })

app.controller("AboutCtrl", function($scope){
    
 })

app.controller("ContactCtrl", function($scope){
    
 })
