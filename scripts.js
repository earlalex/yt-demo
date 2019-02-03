var settings = {
	apiKey         : 'AIzaSyDHAPNhJ1mO3ccRhiLvh2BLkL_EfECjrVY',
	client         : '393661548459-e1as6ms1k3bkgitfak6u2t17adg92rvf.apps.googleusercontent.com',
	endpoint       : 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
	scope          : 'https://www.googleapis.com/auth/youtube.readonly',
    GoogleAuth     : gapi.auth2.getAuthInstance(),
    user           : this.GoogleAuth.currentUser.get(),
    isAuthorized   : this.user.hasGrantedScopes( this.scope ),
	loginBtn       : document.getElementById( 'login' ),
	logoutBtn      : document.getElementById( 'logout' ),
	loginArea      : document.getElementById( 'login-area' ),
	logoutArea     : document.getElementById( 'logout-area' ),
	form           : document.getElementById( 'search' ),
	formInput      : document.getElementById( 'search-input' ),
	channel        : document.getElementById( 'channel' ),
	videos         : document.getElementById( 'videos' ),
	noResults      : document.getElementById( 'no-results' ),
	showResults    : document.getElementById( 'show-results' ),
	defaultChannel : 'UCpMkVKgIolGzmfA09rlJ2tQ'
};

function handleClientLoad() {

	gapi.load( 'client:auth2', initClient );
}

function initClient() {

	let { 
		apiKey,
		client,
		endpoint,
		scope,
		GoogleAuth,
		user,
		loginBtn,
		logoutBtn
	} = settings;
    
    gapi.client.init({
        'apiKey': apiKey,
        'discoveryDocs': endpoint,
        'clientId': client,
        'scope': scope
    }).then( function() {

		GoogleAuth.isSignedIn.listen( updateSigninStatus );
      	
      	setSigninStatus();

      	loginBtn.onClick(function() {
    
        	handleAuthClick();
     	 }); 

      	logoutBtn.onClick(function() {
    
        	revokeAccess();
      	}); 
    });
  }

  function handleAuthClick() {
	
	let { 
		GoogleAuth,
	} = settings;
    
    if ( GoogleAuth.isSignedIn.get() ) {
      
      GoogleAuth.signOut();
    } else {

      GoogleAuth.signIn();
    }
  }

  function revokeAccess() {

  	let { 
		GoogleAuth,
	} = settings;

    GoogleAuth.disconnect();
  }

  function setSigninStatus( isSignedIn ) {

	let { 
		scope,
		GoogleAuth,
		user,
		isAuthorized,
		loginBtn,
		loginArea,
		logoutBtn,
		logoutArea,
		channel,
		videos
	} = settings;

    if ( isAuthorized ) {

	    loginBtn.style.display   = 'none';
	    logoutArea.style.display = 'none';
	    logoutBtn.style.display  = 'block';
	    loginArea.style.display  = 'block';
	    channel.style.display    = 'block';
	    videos.style.display     = 'block';
    } else {

	    loginBtn.style.display   = 'block';
	    logoutArea.style.display = 'block';
	    logoutBtn.style.display  = 'none';
	    loginArea.style.display  = 'none';
	    channel.style.display    = 'none';
	    videos.style.display     = 'none';
    }
  }

  function updateSigninStatus( isSignedIn ) {
    
    setSigninStatus();
  }