let settings = {
	apiKey         : 'AIzaSyDHAPNhJ1mO3ccRhiLvh2BLkL_EfECjrVY',
	client         : '393661548459-e1as6ms1k3bkgitfak6u2t17adg92rvf.apps.googleusercontent.com',
	endpoint       : ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
	scope          : 'https://www.googleapis.com/auth/youtube.readonly',
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
console.log(gapi);

}

function initClient() {
    
    gapi.client.init({
        'apiKey'        : settings.apiKey,
        'discoveryDocs' : settings.endpoint,
        'clientId'      : settings.client,
        'scope'         : settings.scope
    }).then( function() {

		settings.GoogleAuth   = gapi.auth2.getAuthInstance();
		settings.user         = settings.GoogleAuth.currentUser.get();
		settings.isAuthorized = settings.user.hasGrantedScopes( settings.scope );
		settings.GoogleAuth.isSignedIn.listen( updateSigninStatus );
      	
      	setSigninStatus();

      	settings.loginBtn.onClick(function() {
    
        	handleAuthClick();
     	 }); 

      	settings.logoutBtn.onClick(function() {
    
        	revokeAccess();
      	}); 
    });
}

function handleAuthClick() {
    
    if ( settings.GoogleAuth.isSignedIn.get() ) {
      
      settings.GoogleAuth.signOut();
    } else {

      settings.GoogleAuth.signIn();
    }
}

function revokeAccess() {

    settings.GoogleAuth.disconnect();
}

function setSigninStatus( isSignedIn ) {

    if ( settings.isAuthorized ) {

	    settings.loginBtn.style.display   = 'none';
	    settings.logoutArea.style.display = 'none';
	    settings.logoutBtn.style.display  = 'block';
	    settings.loginArea.style.display  = 'block';
	    settings.channel.style.display    = 'block';
	    settings.videos.style.display     = 'block';
    } else {

	    settings.loginBtn.style.display   = 'block';
	    settings.logoutArea.style.display = 'block';
	    settings.logoutBtn.style.display  = 'none';
	    settings.loginArea.style.display  = 'none';
	    settongs.channel.style.display    = 'none';
	    settings.videos.style.display     = 'none';
    }
}

function updateSigninStatus( isSignedIn ) {
    
    setSigninStatus();
}