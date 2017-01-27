define(["playbackManager","dom","inputmanager","datetime","itemHelper","mediaInfo","focusManager","imageLoader","scrollHelper","events","connectionManager","browser","globalize","apphost","layoutManager","scrollStyles","emby-slider"],function(playbackManager,dom,inputManager,datetime,itemHelper,mediaInfo,focusManager,imageLoader,scrollHelper,events,connectionManager,browser,globalize,appHost,layoutManager){"use strict";function seriesImageUrl(item,options){if("Episode"!==item.Type)return null;if(options=options||{},options.type=options.type||"Primary","Primary"===options.type&&item.SeriesPrimaryImageTag)return options.tag=item.SeriesPrimaryImageTag,connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.SeriesId,options);if("Thumb"===options.type){if(item.SeriesThumbImageTag)return options.tag=item.SeriesThumbImageTag,connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.SeriesId,options);if(item.ParentThumbImageTag)return options.tag=item.ParentThumbImageTag,connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.ParentThumbItemId,options)}return null}function imageUrl(item,options){return options=options||{},options.type=options.type||"Primary",item.ImageTags&&item.ImageTags[options.type]?(options.tag=item.ImageTags[options.type],connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.PrimaryImageItemId||item.Id,options)):"Primary"===options.type&&item.AlbumId&&item.AlbumPrimaryImageTag?(options.tag=item.AlbumPrimaryImageTag,connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.AlbumId,options)):null}function logoImageUrl(item,apiClient,options){return options=options||{},options.type="Logo",item.ImageTags&&item.ImageTags.Logo?(options.tag=item.ImageTags.Logo,apiClient.getScaledImageUrl(item.Id,options)):item.ParentLogoImageTag?(options.tag=item.ParentLogoImageTag,apiClient.getScaledImageUrl(item.ParentLogoItemId,options)):null}return function(view,params){function updateNowPlayingInfo(state){var item=state.NowPlayingItem;return currentItem=item,setPoster(item),item?(setTitle(item),view.querySelector(".osdTitle").innerHTML=itemHelper.getDisplayName(item),view.querySelector(".osdMediaInfo").innerHTML=mediaInfo.getPrimaryMediaInfoHtml(item,{runtime:!1,subtitles:!1,tomatoes:!1,endsAt:!1}),nowPlayingVolumeSlider.disabled=!1,nowPlayingPositionSlider.disabled=!1,btnFastForward.disabled=!1,btnRewind.disabled=!1,playbackManager.subtitleTracks(currentPlayer).length?view.querySelector(".btnSubtitles").classList.remove("hide"):view.querySelector(".btnSubtitles").classList.add("hide"),void(playbackManager.audioTracks(currentPlayer).length>1?view.querySelector(".btnAudio").classList.remove("hide"):view.querySelector(".btnAudio").classList.add("hide"))):(Emby.Page.setTitle(""),nowPlayingVolumeSlider.disabled=!0,nowPlayingPositionSlider.disabled=!0,btnFastForward.disabled=!0,btnRewind.disabled=!0,view.querySelector(".btnSubtitles").classList.add("hide"),view.querySelector(".btnAudio").classList.add("hide"),view.querySelector(".osdTitle").innerHTML="",void(view.querySelector(".osdMediaInfo").innerHTML=""))}function setTitle(item){var url=logoImageUrl(item,connectionManager.getApiClient(item.ServerId),{});url||Emby.Page.setTitle("")}function setPoster(item){var osdPoster=view.querySelector(".osdPoster");if(item){var imgUrl=seriesImageUrl(item,{type:"Primary"})||seriesImageUrl(item,{type:"Thumb"})||imageUrl(item,{type:"Primary"});if(imgUrl)return void(osdPoster.innerHTML='<img src="'+imgUrl+'" />')}osdPoster.innerHTML=""}function isOsdOpen(){return _osdOpen}function showOsd(){slideDownToShow(headerElement),slideUpToShow(osdBottomElement),startHideTimer()}function hideOsd(){slideUpToHide(headerElement),slideDownToHide(osdBottomElement)}function startHideTimer(){stopHideTimer(),hideTimeout=setTimeout(hideOsd,5e3)}function stopHideTimer(){hideTimeout&&(clearTimeout(hideTimeout),hideTimeout=null)}function slideDownToShow(elem){elem.classList.remove("osdHeader-hidden")}function slideUpToHide(elem){elem.classList.add("osdHeader-hidden")}function clearBottomPanelAnimationEventListeners(elem){dom.removeEventListener(elem,transitionEndEventName,onSlideDownComplete,{once:!0})}function slideUpToShow(elem){_osdOpen||(_osdOpen=!0,clearBottomPanelAnimationEventListeners(elem),elem.classList.remove("hide"),void elem.offsetWidth,elem.classList.remove("videoOsdBottom-hidden"),setTimeout(function(){focusManager.focus(elem.querySelector(".btnPause"))},50),view.dispatchEvent(new CustomEvent("video-osd-show",{bubbles:!0,cancelable:!1})))}function onSlideDownComplete(e){var elem=e.target;elem.classList.add("hide"),dom.removeEventListener(elem,transitionEndEventName,onSlideDownComplete,{once:!0}),view.dispatchEvent(new CustomEvent("video-osd-hide",{bubbles:!0,cancelable:!1}))}function slideDownToHide(elem){_osdOpen&&(clearBottomPanelAnimationEventListeners(elem),void elem.offsetWidth,elem.classList.add("videoOsdBottom-hidden"),dom.addEventListener(elem,transitionEndEventName,onSlideDownComplete,{once:!0}),_osdOpen=!1)}function onMouseMove(e){var eventX=e.screenX||0,eventY=e.screenY||0,obj=lastMouseMoveData;return obj?void(Math.abs(eventX-obj.x)<10&&Math.abs(eventY-obj.y)<10||(obj.x=eventX,obj.y=eventY,showOsd())):void(lastMouseMoveData={x:eventX,y:eventY})}function onInputCommand(e){switch(e.detail.command){case"left":isOsdOpen()?showOsd():(e.preventDefault(),playbackManager.rewind());break;case"right":isOsdOpen()?showOsd():(e.preventDefault(),playbackManager.fastForward());break;case"up":case"down":case"select":case"menu":case"info":case"play":case"playpause":case"pause":case"fastforward":case"rewind":case"next":case"previous":showOsd()}}function updateFullscreenIcon(){playbackManager.isFullscreen(currentPlayer)?(view.querySelector(".btnFullscreen").setAttribute("title",globalize.translate("ExitFullscreen")),view.querySelector(".btnFullscreen i").innerHTML="&#xE5D1;"):(view.querySelector(".btnFullscreen").setAttribute("title",globalize.translate("Fullscreen")),view.querySelector(".btnFullscreen i").innerHTML="&#xE5D0;")}function onPlayerChange(){var player=playbackManager.getCurrentPlayer();player&&!player.isLocalPlayer?view.querySelector(".btnCast i").innerHTML="&#xE308;":view.querySelector(".btnCast i").innerHTML="&#xE307;",bindToPlayer(player)}function onStateChanged(event,state){var player=this;state.NowPlayingItem&&(isEnabled=!0,updatePlayerStateInternal(event,state),updatePlaylist(player),enableStopOnBack(!0))}function onPlayPauseStateChanged(e){if(isEnabled){var player=this;updatePlayPauseState(player.paused())}}function onVolumeChanged(e){if(isEnabled){var player=this;updatePlayerVolumeState(player.isMuted(),player.getVolume())}}function onPlaybackStart(e,state){console.log("nowplaying event: "+e.type);var player=this;onStateChanged.call(player,e,state)}function onPlaybackStopped(e,state){currentRuntimeTicks=null,console.log("nowplaying event: "+e.type),"Video"!==state.nextMediaType&&(view.removeEventListener("viewbeforehide",onViewHideStopPlayback),Emby.Page.back())}function bindToPlayer(player){player!==currentPlayer&&(releaseCurrentPlayer(),currentPlayer=player,player&&(playbackManager.getPlayerState(player).then(function(state){onStateChanged.call(player,{type:"init"},state)}),events.on(player,"playbackstart",onPlaybackStart),events.on(player,"playbackstop",onPlaybackStopped),events.on(player,"volumechange",onVolumeChanged),events.on(player,"pause",onPlayPauseStateChanged),events.on(player,"playing",onPlayPauseStateChanged),events.on(player,"timeupdate",onTimeUpdate),events.on(player,"fullscreenchange",updateFullscreenIcon)))}function releaseCurrentPlayer(){var player=currentPlayer;player&&(events.off(player,"playbackstart",onPlaybackStart),events.off(player,"playbackstop",onPlaybackStopped),events.off(player,"volumechange",onVolumeChanged),events.off(player,"pause",onPlayPauseStateChanged),events.off(player,"playing",onPlayPauseStateChanged),events.off(player,"timeupdate",onTimeUpdate),events.off(player,"fullscreenchange",updateFullscreenIcon),currentPlayer=null)}function onTimeUpdate(e){if(isEnabled){var now=(new Date).getTime();if(!(now-lastUpdateTime<700)){lastUpdateTime=now;var player=this;currentRuntimeTicks=playbackManager.duration(player),updateTimeDisplay(playbackManager.currentTime(player),currentRuntimeTicks)}}}function updatePlayPauseState(isPaused){isPaused?view.querySelector(".btnPause i").innerHTML="&#xE037;":view.querySelector(".btnPause i").innerHTML="&#xE034;"}function updatePlayerStateInternal(event,state){var playerInfo=playbackManager.getPlayerInfo(),playState=state.PlayState||{};updatePlayPauseState(playState.IsPaused);var supportedCommands=playerInfo.supportedCommands;currentPlayerSupportedCommands=supportedCommands,updatePlayerVolumeState(playState.IsMuted,playState.VolumeLevel),nowPlayingPositionSlider&&!nowPlayingPositionSlider.dragging&&(nowPlayingPositionSlider.disabled=!playState.CanSeek),btnFastForward.disabled=!playState.CanSeek,btnRewind.disabled=!playState.CanSeek;var nowPlayingItem=state.NowPlayingItem||{};updateTimeDisplay(playState.PositionTicks,nowPlayingItem.RunTimeTicks),updateNowPlayingInfo(state),state.MediaSource&&state.MediaSource.SupportsTranscoding&&supportedCommands.indexOf("SetMaxStreamingBitrate")!==-1?view.querySelector(".btnSettings").classList.remove("hide"):view.querySelector(".btnSettings").classList.add("hide"),supportedCommands.indexOf("ToggleFullscreen")===-1?view.querySelector(".btnFullscreen").classList.add("hide"):view.querySelector(".btnFullscreen").classList.remove("hide"),supportedCommands.indexOf("PictureInPicture")===-1?view.querySelector(".btnPip").classList.add("hide"):view.querySelector(".btnPip").classList.remove("hide"),updateFullscreenIcon()}function updateTimeDisplay(positionTicks,runtimeTicks){if(nowPlayingPositionSlider&&!nowPlayingPositionSlider.dragging){if(runtimeTicks){var pct=positionTicks/runtimeTicks;pct*=100,nowPlayingPositionSlider.value=pct}else nowPlayingPositionSlider.value=0;runtimeTicks&&null!=positionTicks?endsAtText.innerHTML="&nbsp;&nbsp;-&nbsp;&nbsp;"+mediaInfo.getEndsAtFromPosition(runtimeTicks,positionTicks,!0):endsAtText.innerHTML=""}updateTimeText(nowPlayingPositionText,positionTicks),updateTimeText(nowPlayingDurationText,runtimeTicks,!0)}function updatePlayerVolumeState(isMuted,volumeLevel){var supportedCommands=currentPlayerSupportedCommands,showMuteButton=!0,showVolumeSlider=!0;supportedCommands.indexOf("Mute")===-1&&(showMuteButton=!1),supportedCommands.indexOf("SetVolume")===-1&&(showVolumeSlider=!1),currentPlayer.isLocalPlayer&&appHost.supports("physicalvolumecontrol")&&(showMuteButton=!1,showVolumeSlider=!1),isMuted?(view.querySelector(".buttonMute").setAttribute("title",globalize.translate("Unmute")),view.querySelector(".buttonMute i").innerHTML="&#xE04F;"):(view.querySelector(".buttonMute").setAttribute("title",globalize.translate("Mute")),view.querySelector(".buttonMute i").innerHTML="&#xE050;"),showMuteButton?view.querySelector(".buttonMute").classList.remove("hide"):view.querySelector(".buttonMute").classList.add("hide"),nowPlayingVolumeSlider&&(showVolumeSlider?nowPlayingVolumeSliderContainer.classList.remove("hide"):nowPlayingVolumeSliderContainer.classList.add("hide"),nowPlayingVolumeSlider.dragging||(nowPlayingVolumeSlider.value=volumeLevel||0))}function updatePlaylist(player){var btnPreviousTrack=view.querySelector(".btnPreviousTrack"),btnNextTrack=view.querySelector(".btnNextTrack");btnPreviousTrack.classList.remove("hide"),btnNextTrack.classList.remove("hide"),btnNextTrack.disabled=!1,btnPreviousTrack.disabled=!1}function updateTimeText(elem,ticks,divider){if(null==ticks)return void(elem.innerHTML="");var html=datetime.getDisplayRunningTime(ticks);divider&&(html="&nbsp;/&nbsp;"+html),elem.innerHTML=html}function onSettingsButtonClick(e){var btn=this;require(["playerSettingsMenu"],function(playerSettingsMenu){playerSettingsMenu.show({mediaType:"Video",player:currentPlayer,positionTo:btn})})}function showAudioTrackSelection(){var player=currentPlayer,audioTracks=playbackManager.audioTracks(player),currentIndex=playbackManager.getAudioStreamIndex(player),menuItems=audioTracks.map(function(stream){var opt={name:stream.DisplayTitle,id:stream.Index};return stream.Index===currentIndex&&(opt.selected=!0),opt}),positionTo=this;require(["actionsheet"],function(actionsheet){actionsheet.show({items:menuItems,title:globalize.translate("Audio"),positionTo:positionTo}).then(function(id){var index=parseInt(id);index!==currentIndex&&playbackManager.setAudioStreamIndex(index,currentPlayer)})})}function showSubtitleTrackSelection(){var player=currentPlayer,streams=playbackManager.subtitleTracks(player),currentIndex=playbackManager.getSubtitleStreamIndex(player);null==currentIndex&&(currentIndex=-1),streams.unshift({Index:-1,DisplayTitle:globalize.translate("Off")});var menuItems=streams.map(function(stream){var opt={name:stream.DisplayTitle,id:stream.Index};return stream.Index===currentIndex&&(opt.selected=!0),opt}),positionTo=this;require(["actionsheet"],function(actionsheet){actionsheet.show({title:globalize.translate("Subtitles"),items:menuItems,positionTo:positionTo}).then(function(id){var index=parseInt(id);index!==currentIndex&&playbackManager.setSubtitleStreamIndex(index,currentPlayer)})})}function onWindowKeyDown(e){32!==e.keyCode||isOsdOpen()||(playbackManager.playPause(currentPlayer),showOsd())}function getImgUrl(item,chapter,index,maxWidth,apiClient){return chapter.ImageTag?apiClient.getScaledImageUrl(item.Id,{maxWidth:maxWidth,tag:chapter.ImageTag,type:"Chapter",index:index}):null}function getChapterBubbleHtml(apiClient,item,chapters,positionTicks){for(var chapter,index=-1,i=0,length=chapters.length;i<length;i++){var currentChapter=chapters[i];positionTicks>=currentChapter.StartPositionTicks&&(chapter=currentChapter,index=i)}if(!chapter)return null;var src=getImgUrl(item,chapter,index,400,apiClient);if(src){var html='<div class="chapterThumbContainer">';return html+='<img class="chapterThumb" src="'+src+'" />',html+='<div class="chapterThumbTextContainer">',html+='<div class="chapterThumbText chapterThumbText-dim">',html+=chapter.Name,html+="</div>",html+='<h1 class="chapterThumbText">',html+=datetime.getDisplayRunningTime(positionTicks),html+="</h1>",html+="</div>",html+="</div>"}return null}function onViewHideStopPlayback(){if(playbackManager.isPlayingVideo()){var player=currentPlayer;view.removeEventListener("viewbeforehide",onViewHideStopPlayback),releaseCurrentPlayer(),playbackManager.stop(player)}}function enableStopOnBack(enabled){view.removeEventListener("viewbeforehide",onViewHideStopPlayback),enabled&&playbackManager.isPlayingVideo(currentPlayer)&&view.addEventListener("viewbeforehide",onViewHideStopPlayback)}var currentPlayer,isEnabled,currentItem,hideTimeout,lastMouseMoveData,currentPlayerSupportedCommands=[],currentRuntimeTicks=0,lastUpdateTime=0,nowPlayingVolumeSlider=view.querySelector(".osdVolumeSlider"),nowPlayingVolumeSliderContainer=view.querySelector(".osdVolumeSliderContainer"),nowPlayingPositionSlider=view.querySelector(".osdPositionSlider"),nowPlayingPositionText=view.querySelector(".osdPositionText"),nowPlayingDurationText=view.querySelector(".osdDurationText"),endsAtText=view.querySelector(".endsAtText"),btnRewind=view.querySelector(".btnRewind"),btnFastForward=view.querySelector(".btnFastForward"),transitionEndEventName=dom.whichTransitionEvent(),headerElement=document.querySelector(".skinHeader"),osdBottomElement=document.querySelector(".videoOsdBottom"),_osdOpen=!0;view.addEventListener("viewbeforeshow",function(e){headerElement.classList.add("osdHeader"),Emby.Page.setTransparency("full")}),view.addEventListener("viewshow",function(e){events.on(playbackManager,"playerchange",onPlayerChange),bindToPlayer(playbackManager.getCurrentPlayer()),dom.addEventListener(document,"mousemove",onMouseMove,{passive:!0}),document.body.classList.add("autoScrollY"),showOsd(),inputManager.on(window,onInputCommand),dom.addEventListener(window,"keydown",onWindowKeyDown,{passive:!0})}),view.addEventListener("viewbeforehide",function(){dom.removeEventListener(window,"keydown",onWindowKeyDown,{passive:!0}),stopHideTimer(),headerElement.classList.remove("osdHeader"),headerElement.classList.remove("osdHeader-hidden"),dom.removeEventListener(document,"mousemove",onMouseMove,{passive:!0}),document.body.classList.remove("autoScrollY"),inputManager.off(window,onInputCommand),events.off(playbackManager,"playerchange",onPlayerChange),releaseCurrentPlayer()}),appHost.supports("remotecontrol")&&!layoutManager.tv&&view.querySelector(".btnCast").classList.remove("hide"),view.querySelector(".btnCast").addEventListener("click",function(){var btn=this;require(["playerSelectionMenu"],function(playerSelectionMenu){playerSelectionMenu.show(btn)})}),view.querySelector(".btnFullscreen").addEventListener("click",function(){playbackManager.toggleFullscreen(currentPlayer)}),view.querySelector(".btnPip").addEventListener("click",function(){playbackManager.togglePictureInPicture(currentPlayer)}),view.querySelector(".btnSettings").addEventListener("click",onSettingsButtonClick),view.addEventListener("viewhide",function(){headerElement.classList.remove("hide")}),view.querySelector(".pageContainer").addEventListener("click",function(){browser.touch||playbackManager.playPause(currentPlayer),showOsd()}),view.querySelector(".buttonMute").addEventListener("click",function(){playbackManager.toggleMute(currentPlayer)}),nowPlayingVolumeSlider.addEventListener("change",function(){playbackManager.setVolume(this.value,currentPlayer)}),nowPlayingPositionSlider.addEventListener("change",function(){if(currentPlayer){var newPercent=parseFloat(this.value);playbackManager.seekPercent(newPercent,currentPlayer)}}),nowPlayingPositionSlider.getBubbleHtml=function(value){if(showOsd(),!currentRuntimeTicks)return"--:--";var ticks=currentRuntimeTicks;ticks/=100,ticks*=value;var item=currentItem;if(item&&item.Chapters&&item.Chapters.length&&item.Chapters[0].ImageTag){var html=getChapterBubbleHtml(connectionManager.getApiClient(item.ServerId),item,item.Chapters,ticks);if(html)return html}return'<h1 class="sliderBubbleText">'+datetime.getDisplayRunningTime(ticks)+"</h1>"},view.querySelector(".btnPreviousTrack").addEventListener("click",function(){playbackManager.previousChapter(currentPlayer)}),view.querySelector(".btnPause").addEventListener("click",function(){playbackManager.playPause(currentPlayer)}),view.querySelector(".btnNextTrack").addEventListener("click",function(){playbackManager.nextChapter(currentPlayer)}),btnRewind.addEventListener("click",function(){playbackManager.rewind(currentPlayer)}),btnFastForward.addEventListener("click",function(){playbackManager.fastForward(currentPlayer)}),view.querySelector(".btnAudio").addEventListener("click",showAudioTrackSelection),view.querySelector(".btnSubtitles").addEventListener("click",showSubtitleTrackSelection)}});