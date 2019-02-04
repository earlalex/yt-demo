let settings = {
	apiKey         : 'AIzaSyDHAPNhJ1mO3ccRhiLvh2BLkL_EfECjrVY',
	client         : '393661548459-e1as6ms1k3bkgitfak6u2t17adg92rvf.apps.googleusercontent.com',
	endpoint       : ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
	scope          : 'https://www.googleapis.com/auth/youtube.readonly',
	defaultChannel : 'UCpMkVKgIolGzmfA09rlJ2tQ'
};

let videoResults = {
	liked  : '',
	search : ''
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
	settings.image       = document.getElementById( 'user-image' ),
	settings.name        = document.getElementById( 'user-name' ),
	settings.email       = document.getElementById( 'user-email' ),
	settings.videos      = document.getElementById( 'videos' ),
	settings.videosTitle = document.getElementById( 'videos-title' ),
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

			if ( term !== '' ) {

				settings.videos.style.display     = 'none';

				getSearch( term )
					.execute( function( searchResponse ) {
				
					const searchResults = searchResponse.items;

					videoResults.search = searchResponse.items;

					searchResults.forEach( item => {

						let vidId = item.id.videoId;

						videoResults.search += `<div class="video-embed">
	<iframe width="100%" height="auto" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>`;

					});

					settings.videosTitle.innerHTML = 'Video Search',
					settings.videos.innerHTML      = videoResults.search,
					settings.videos.style.display  = 'block';
				});
			} else {

				alert( 'You must enter something to search for.' );
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
	    settings.loginArea.style.display  = 'block',
	    settings.logoutBtn.style.display  = 'inline-block',
	    settings.email.style.display      = 'inline-block',
		settings.image.src                = settings.user.w3.Paa,
		settings.name.innerHTML           = settings.user.w3.ig,
		settings.email.innerHTML          = settings.user.w3.U3;
    	
    	getChannels()
	    	.execute( function( response ) {

	    		const likedID = response
					.items[ 0 ]
					.contentDetails
					.relatedPlaylists
					.likes;

		    	getLiked( likedID )
					.execute( function( likedResponse ) {

					const likedResults = likedResponse.items;

					likedResults.forEach( item => {

						let vidId = item.snippet.resourceId.videoId;

						videoResults.liked += `
							<div class="video-embed">
								<iframe width="100%" height="auto" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
							</div>
						`;
					});

					settings.videosTitle.innerHTML = 'Liked Videos',
					settings.videos.innerHTML      = videoResults.liked.replace('[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]',''),
					settings.videos.style.display  = 'block';
				});
	    });
    } else {

	    settings.loginBtn.style.display   = 'block',
	    settings.logoutArea.style.display = 'block',
	    settings.form.style.display       = 'none',
	    settings.logoutBtn.style.display  = 'none',
	    settings.loginArea.style.display  = 'none',
	    settings.email.style.display      = 'none',
	    settings.videos.style.display     = 'none',
	    settings.videos.innerHTML         = '',
		settings.image.src                = '',
		settings.name.innerHTML           = '',
		settings.email.innerHTML          = '';
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