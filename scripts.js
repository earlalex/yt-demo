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
      	
      	setSigninStatus(settings.GoogleAuth.isSignedIn.get());

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
}

function revokeAccess() {

    settings.GoogleAuth.disconnect();
}

function setSigninStatus( isSignedIn ) {

    if ( isSignedIn ) {
	
	    settings.loginBtn.style.display   = 'none';
	    settings.logoutArea.style.display = 'none';
	    settings.logoutBtn.style.display  = 'block';
	    settings.loginArea.style.display  = 'block';
	    settings.channel.style.display    = 'block';
	    settings.videos.style.display     = 'block';

    	getChannels()
	    	.execute(function(response) {

	    		let likedID = response
					.items[0]
					.contentDetails
					.relatedPlaylists
					.likes;

		    	getLiked( likedID )
					.execute(function(likedResponse){

						let likedPlaylist = likedResponse.items;

			    		for ( let i = likedPlaylist.length - 1; i >= 0; i-- ) {

			    			var likedvideos.i = {
			    				'channel'     : likedPlaylist[i].snippet.channelTitle,
			    				'channelId'   : likedPlaylist[i].snippet.channelId,
			    				'title'       : likedPlaylist[i].snippet.title,
			    				'description' : likedPlaylist[i].snippet.description,
			    				'publishedAt' : likedPlaylist[i].snippet.publishedAt,
			    				'videoId'     : likedPlaylist[i].snippet.resourceId.videoId,
			    				'thumbnail'   : likedPlaylist[i].snippet.thumbnails.high.url
			    			}
			    		}
			    	});
	    	});

	   console.log(likedvideos);
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
    
    setSigninStatus( isSignedIn );
}


function createResource(properties) {

	var resource        = {};
	var normalizedProps = properties;

	for (var p in properties) {

	  var value = properties[p];

	  if (p && p.substr(-2, 2) == '[]') {

	    var adjustedName = p.replace('[]', '');

	    if (value) {

	      normalizedProps[adjustedName] = value.split(',');
	    }


	    delete normalizedProps[p];
	  }
	}

	for (var p in normalizedProps) {

	  // Leave properties that don't have values out of inserted resource.
	  if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {

	    var propArray = p.split('.');

	    var ref = resource;

	    for (var pa = 0; pa < propArray.length; pa++) {

	      var key = propArray[pa];

	      if (pa == propArray.length - 1) {

	        ref[key] = normalizedProps[p];
	      } else {

	        ref = ref[key] = ref[key] || {};
	      }
	    }
	  };
	}

	return resource;
}

function removeEmptyParams(params) {
	for (var p in params) {
	  if (!params[p] || params[p] == 'undefined') {
	    delete params[p];
	  }
	}
	return params;
}

function buildApiRequest(requestMethod, path, params, properties) {
	params = removeEmptyParams(params);
	var request;
	if (properties) {
	  var resource = createResource(properties);
	  request = gapi.client.request({
	      'body': resource,
	      'method': requestMethod,
	      'path': path,
	      'params': params
	  });
	} else {
	  request = gapi.client.request({
	      'method': requestMethod,
	      'path': path,
	      'params': params
	  });
	}
	return request;
}

function getChannels() {

	return buildApiRequest('GET',
        '/youtube/v3/channels',
        {
        	'mine': true,
        	'part': 'contentDetails',
        	'key' : settings.apiKey
    	}
    );
}
function getLiked( id ) {

	return buildApiRequest('GET',
        '/youtube/v3/playlistItems',
        {
        	'part'       : 'snippet',
        	'playlistId' : id,
        	'key'        : settings.apiKey
    	}
    );
}

