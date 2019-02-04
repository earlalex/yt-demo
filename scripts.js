let settings = {
	apiKey         : 'AIzaSyDHAPNhJ1mO3ccRhiLvh2BLkL_EfECjrVY',
	client         : '393661548459-e1as6ms1k3bkgitfak6u2t17adg92rvf.apps.googleusercontent.com',
	endpoint       : ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
	scope          : 'https://www.googleapis.com/auth/youtube.readonly',
	defaultChannel : 'UCpMkVKgIolGzmfA09rlJ2tQ'
};

let videoResults = {
	liked  : {},
	search : {}
}

function handleClientLoad() {

	gapi.load( 'client:auth2', initClient );

	settings.loginBtn    = document.getElementById( 'login' ),
	settings.logoutBtn   = document.getElementById( 'logout' ),
	settings.loginArea   = document.getElementById( 'login-area' ),
	settings.logoutArea  = document.getElementById( 'logout-area' ),
	settings.form        = document.getElementById( 'search' ),
	settings.formInput   = document.getElementById( 'search-input' ),
	settings.formSubmit  = document.getElementById( 'search-submit' ),
	settings.email       = document.getElementById( 'email' ),
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

		settings.GoogleAuth   = gapi.auth2.getAuthInstance(),
		settings.user         = settings.GoogleAuth.currentUser.get(),
		settings.isAuthorized = settings.user.hasGrantedScopes( settings.scope );
	
		settings.GoogleAuth.isSignedIn.listen( updateSigninStatus );
      	
      	setSigninStatus(settings.GoogleAuth.isSignedIn.get());

      	settings.loginBtn.onclick = function() {
    
        	handleAuthClick();
     	 };

      	settings.logoutBtn.onclick = function() {
    
        	revokeAccess();
		};

		settings.formSubmit.onclick = function( e ) {

			e.preventDefault();

			let term = settings.formInput.value;

						console.log( term );
			if ( term !== '' ) {

				getSearch( term )
					.execute( function( searchResponse ) {
				
					let searchResults = searchResponse.items;

					for ( var i = searchResults.length - 1; i >= 0; i-- ) {

						videoResults.search[ i ] = {
							'channel'     : searchResults[ i ].snippet.channelTitle,
							'channelId'   : searchResults[ i ].snippet.channelId,
							'title'       : searchResults[ i ].snippet.title,
							'description' : searchResults[ i ].snippet.description,
							'publishedAt' : searchResults[ i ].snippet.publishedAt,
							'videoId'     : searchResults[ i ].snippet.resourceId.videoId,
							'thumbnail'   : searchResults[ i ].snippet.thumbnails.high.url
						}
					}
				});
			} else {

						console.log( 'Nothing' );
			}
		}
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
	
	    settings.loginBtn.style.display   = 'none',
	    settings.logoutArea.style.display = 'none',
	    settings.form.style.display       = 'block',
	    settings.logoutBtn.style.display  = 'block',
	    settings.loginArea.style.display  = 'block',
	    settings.email.style.display      = 'block',
	    settings.videos.style.display     = 'block';
    	
    	getChannels()
	    	.execute( function( response ) {

	    		let likedID = response
					.items[ 0 ]
					.contentDetails
					.relatedPlaylists
					.likes;

		    	getLiked( likedID )
					.execute( function( likedResponse ) {

					let likedResults = likedResponse.items;

					for ( var i = likedResults.length - 1; i >= 0; i-- ) {

						videoResults.liked[ i ] = {
							'channel'     : likedResults[ i ].snippet.channelTitle,
							'channelId'   : likedResults[ i ].snippet.channelId,
							'title'       : likedResults[ i ].snippet.title,
							'description' : likedResults[ i ].snippet.description,
							'publishedAt' : likedResults[ i ].snippet.publishedAt,
							'videoId'     : likedResults[ i ].snippet.resourceId.videoId,
							'thumbnail'   : likedResults[ i ].snippet.thumbnails.high.url
						}
					}
				});
	    });

	    console.log(videoResults.search,videoResults.liked);
    } else {

	    settings.loginBtn.style.display   = 'block',
	    settings.logoutArea.style.display = 'block',
	    settings.form.style.display       = 'none',
	    settings.logoutBtn.style.display  = 'none',
	    settings.loginArea.style.display  = 'none',
	    settings.email.style.display      = 'none',
	    settings.videos.style.display     = 'none';
    }
}

function updateSigninStatus( isSignedIn ) {
    
    setSigninStatus( isSignedIn );
}


function createResource( properties ) {

	let resource        = {};
	let normalizedProps = properties;

	for ( var p in properties ) {

	  let value = properties[ p ];

	  if ( p && p.substr( -2, 2 ) == '[]' ) {

	    let adjustedName = p.replace( '[]', '' );

	    if ( value ) {

	      normalizedProps[ adjustedName ] = value.split( ',' );
	    }


	    delete normalizedProps[ p ];
	  }
	}

	for ( var p in normalizedProps ) {

	  if ( normalizedProps.hasOwnProperty( p ) && normalizedProps[ p ] ) {

	    let propArray = p.split('.');

	    let ref = resource;

	    for ( var pa = 0; pa < propArray.length; pa++ ) {

	      let key = propArray[ pa ];

	      if ( pa == propArray.length - 1 ) {

	        ref[ key ] = normalizedProps[ p ];
	      } else {

	        ref = ref[ key ] = ref[ key ] || {};
	      }
	    }
	  };
	}

	return resource;
}

function removeEmptyParams( params ) {

	for ( var p in params ) {
	
	  if ( !params[ p ] || params[ p ] == 'undefined' ) {
	
	    delete params[ p ];
	  }
	}
	
	return params;
}

function buildApiRequest( requestMethod, path, params, properties ) {
	
	params = removeEmptyParams( params );
	
	let request;
	
	if ( properties ) {
	
	  let resource = createResource( properties );
	
	  request = gapi.client.request({
	      'body'   : resource,
	      'method' : requestMethod,
	      'path'   : path,
	      'params' : params
	  });
	} else {
	
	  request = gapi.client.request({
	      'method' : requestMethod,
	      'path'   : path,
	      'params' : params
	  });
	}
	
	return request;
}

function getChannels() {

	return buildApiRequest('GET',
        '/youtube/v3/channels',
        {
        	'mine' : true,
        	'part' : 'contentDetails',
        	'key'  : settings.apiKey
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

function getSearch( term ) {

	return buildApiRequest('GET',
        '/youtube/v3/search',
        {
        	'part'       : 'snippet',
        	'q'          : term,
        	'type'       : 'video',
        	'maxResults' : '20',
        	'key'        : settings.apiKey
    	}
    );

}