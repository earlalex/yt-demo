let settings = {
	apiKey         : 'AIzaSyDHAPNhJ1mO3ccRhiLvh2BLkL_EfECjrVY',
	client         : '393661548459-e1as6ms1k3bkgitfak6u2t17adg92rvf.apps.googleusercontent.com',
	endpoint       : ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
	scope          : 'https://www.googleapis.com/auth/youtube.readonly',
	defaultChannel : 'UCpMkVKgIolGzmfA09rlJ2tQ'
};


function handleClientLoad() {

	gapi.load( 'client:auth2', initClient );

	settings.loginBtn    = document.getElementById( 'login' ),
	settings.logoutBtn   = document.getElementById( 'logout' ),
	settings.loginArea   = document.getElementById( 'login-area' ),
	settings.logoutArea  = document.getElementById( 'logout-area' ),
	settings.form        = document.getElementById( 'search' ),
	settings.formInput   = document.getElementById( 'search-input' ),
	settings.channel     = document.getElementById( 'channel' ),
	settings.videos      = document.getElementById( 'videos' ),
	settings.noResults   = document.getElementById( 'no-results' ),
	settings.showResults = document.getElementById( 'show-results' );
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

      	settings.loginBtn.onclick = function() {
    
        	handleAuthClick();
     	 };

      	settings.logoutBtn.onclick = function() {
    
        	revokeAccess();
		}; 
    });
}

function handleAuthClick() {
    
    if ( settings.GoogleAuth.isSignedIn.get() ) {
      
      settings.GoogleAuth.signOut();
    } else {

      settings.GoogleAuth.signIn();
    }
    
    window.location.href = 'https://earlalex.github.io/yt-demo/index.html';
}

function revokeAccess() {

    settings.GoogleAuth.disconnect();

    window.location.href = 'https://earlalex.github.io/yt-demo/index.html';
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
	    settings.channel.style.display    = 'none';
	    settings.videos.style.display     = 'none';
    }
}

function updateSigninStatus( isSignedIn ) {
    
    setSigninStatus();
}