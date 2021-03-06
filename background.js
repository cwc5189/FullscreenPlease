function onWindowOnLoad()
{		
	if(document.location.href.indexOf("twitter.com") >= 0){		
		// For statuses there are no previews, so we don't need the listeners and can just
		// find the video iframe because it is already loaded	
		console.log("On twitter");
		
		if(document.location.href.indexOf("status") >= 0)
		{
			console.log("Opened twitter status");
			enableFullScreenTwitter();
		}
		else
		{
			console.log("addingListeners");
			addTwitterListeners();
			addTwitterFeedListener();
		}
		
	}
	
	if(document.location.href.indexOf("youtube.com") < 0) {
		enableFullScreenGeneric();
	}
	
	locChangeHandler();

}

//window.onload=onWindowOnLoad;
window.addEventListener("load", onWindowOnLoad);

function locChangeHandler(){
    this.oldLoc = window.location.href;
    this.Check;

    var that = this;
    var detect = function(){
        if(that.oldLoc!=window.location.href){
            that.oldLoc = window.location.href;
			onWindowOnLoad();
        }
    };
    this.Check = setInterval(function(){ detect() }, 500);
}

function enableFullScreenGeneric(){

	var iframes = document.getElementsByTagName("iframe");
	
	// Find iframes with src of youtube
	for(var i = 0; i < iframes.length; i++){
		if(iframes[i].src.indexOf("youtube") >= 0 && !iframes[i].attributes['allowfullscreen'] ){
			// Add allowfullscreen attribute
			iframes[i].setAttribute('allowfullscreen', '');
			
			// Add fullscreen variable
			var srcCleaner = iframes[i].src;
			if(srcCleaner.indexOf("fs") >= 0)
				srcCleaner = srcCleaner.replace(/fs=\d/gi, "fs=1");
			else
			{
				if(srcCleaner.indexOf("?") < 0)
					srcCleaner += "?fs=1";
				else
					srcCleaner += "&fs=1";
			}
			
			// Add autohide variable
			if(srcCleaner.indexOf("autohide") >= 0)
				srcCleaner = srcCleaner.replace(/autohide=\d/gi, "autohide=1");
			else
			{
				srcCleaner = srcCleaner + "&autohide=1";
			}
			
			iframes[i].src = srcCleaner;
		}
	}
	
	return false;
}

function enableFullScreenTwitter(){
	
	var iframes = document.getElementsByTagName("iframe");
	
	//console.log("enableFullScreenTwitter: Find twitter player cards");
	for(var i = 0; i < iframes.length; i++){
		if(iframes[i].src.indexOf("cardname=player") >= 0){
			video = iframes[i];
			console.log("Found twitter player card");				
			
			//Get the tweet container's first link, twitter only looks at the first one for media
			tweetLinks = iframes[i].parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("twitter-timeline-link");
			
			//console.log(tweetLinks);

			for(var i = 0; i < tweetLinks.length; i++){
				mediaLink = tweetLinks[i];
			
				// If the media link is youtube, do the thing!
				if(mediaLink.attributes["data-expanded-url"].value.replace("youtu.be", "youtube.com").replace("youtube.com", "youtube.com/embed/").indexOf("youtube.com") >= 0)
				{
					
					// Get our video url and make some small adjustments, making it https and making sure the url is youtube.com
					videoUrl = mediaLink.attributes["data-expanded-url"].value.replace("youtu.be", "youtube.com").replace("youtube.com", "youtube.com/embed/").replace("http://", "https://");
					
					// Then add our full screen, autoplay, and autohide to it.
					video.src = videoUrl + "?fs=1&autohide=1";
					
					// Have to wait because it wouldn't set the height until it was finished changing src
					setTimeout(function(){video.height = 315;}, 500);
				}
			}
		}
	}
}

// Called when a twitter iframe card class object is modified. See addTwitterListeners()
function enableFullScreenTwitterListener(target){
	
	var iframes = target.getElementsByTagName("iframe");
	
	console.log("State changed on twitter player card! " + target);
	
	//.log("Find twitter player cards");
	for(var i = 0; i < iframes.length; i++){
		if(iframes[i].src.indexOf("cardname=player") >= 0){
			//console.log("Found twitter player card");				
			
			//Get uncle/aunt preview container that contains the preview image/play button
			previewContainer = iframes[i].parentNode.parentNode.getElementsByClassName("media-preview-container")[0];
			
			//console.log(previewContainer);
			
			//Hide the preview image
			previewContainer.style.display = "none";
			
			// Grab the video url from the preview and add our full screen, autoplay, and autohide to it.
			// Also change the height so it looks nicer
			previewButton = previewContainer.getElementsByTagName("button")[0];
			iframes[i].src = previewButton.attributes["data-source-url"].value + "?fs=1&autoplay=1&autohide=1";
			iframes[i].height = 298;			
		}
	}
}

function addTwitterListeners(){
	// select the twitter cards that are iframe containers (dependant on twitter implementation of classes)
	var target = document.querySelector('.js-macaw-cards-iframe-container');

	console.log("Found " + document.getElementsByClassName('js-macaw-cards-iframe-container').length + " player cards!");
	console.log(document.getElementsByClassName('js-macaw-cards-iframe-container'));
	// create an observer instance that calls our twitter specific fullscreen enabler
	// when something changes
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		enableFullScreenTwitterListener(mutation.target);
	  });    
	});
	 
	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };

	// Actually tell the observer instance to watch the specified objects
	for(var i = 0; i < document.getElementsByClassName('js-macaw-cards-iframe-container').length; i++)
	{
		observer.observe(document.getElementsByClassName('js-macaw-cards-iframe-container')[i], config);
	}


}

function addTwitterFeedListener(){
	var target = document.querySelector('.GridTimeline');
	 
	// create an observer instance that calls our twitter specific fullscreen enabler
	// when something changes
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		addTwitterListeners();
		console.log("Detected twitter feed update");
	  });    
	});
	 
	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };

	// Actually tell the observer instance to watch the specified objects
	observer.observe(target, config);
}
