define(["libraryBrowser","dom","components/categorysyncbuttons","cardBuilder","apphost","scrollStyles","emby-itemscontainer","emby-tabs","emby-button"],function(libraryBrowser,dom,categorysyncbuttons,cardBuilder,appHost){"use strict";return function(view,params){function reload(){Dashboard.showLoadingMsg(),loadResume(),loadNextUp()}function loadNextUp(){var query={Limit:24,Fields:"PrimaryImageAspectRatio,SeriesInfo,DateCreated,BasicSyncInfo",UserId:Dashboard.getCurrentUserId(),ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb"};query.ParentId=LibraryMenu.getTopParentId(),ApiClient.getNextUpEpisodes(query).then(function(result){result.Items.length?view.querySelector(".noNextUpItems").classList.add("hide"):view.querySelector(".noNextUpItems").classList.remove("hide");var container=view.querySelector("#nextUpItems"),supportsImageAnalysis=appHost.supports("imageanalysis");cardBuilder.buildCards(result.Items,{itemsContainer:container,preferThumb:!0,shape:"backdrop",scalable:!0,showTitle:!0,showParentTitle:!0,overlayText:!1,centerText:!supportsImageAnalysis,overlayPlayButton:!0,cardLayout:supportsImageAnalysis,vibrant:supportsImageAnalysis}),Dashboard.hideLoadingMsg()})}function enableScrollX(){return browserInfo.mobile&&AppInfo.enableAppLayouts}function getThumbShape(){return enableScrollX()?"overflowBackdrop":"backdrop"}function loadResume(){var parentId=LibraryMenu.getTopParentId(),screenWidth=dom.getWindowSize().innerWidth,limit=screenWidth>=1600?5:6,options={SortBy:"DatePlayed",SortOrder:"Descending",IncludeItemTypes:"Episode",Filters:"IsResumable",Limit:limit,Recursive:!0,Fields:"PrimaryImageAspectRatio,SeriesInfo,UserData,BasicSyncInfo",ExcludeLocationTypes:"Virtual",ParentId:parentId,ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",EnableTotalRecordCount:!1};ApiClient.getItems(Dashboard.getCurrentUserId(),options).then(function(result){result.Items.length?view.querySelector("#resumableSection").classList.remove("hide"):view.querySelector("#resumableSection").classList.add("hide");var allowBottomPadding=!enableScrollX(),container=view.querySelector("#resumableItems"),supportsImageAnalysis=appHost.supports("imageanalysis"),cardLayout=appHost.preferVisualCards;cardBuilder.buildCards(result.Items,{itemsContainer:container,preferThumb:!0,shape:getThumbShape(),scalable:!0,showTitle:!0,showParentTitle:!0,overlayText:!1,centerText:!cardLayout,overlayPlayButton:!0,allowBottomPadding:allowBottomPadding,cardLayout:cardLayout,vibrant:supportsImageAnalysis})})}function getTabController(page,index,callback){var depends=[];switch(index){case 0:break;case 1:depends.push("scripts/tvlatest");break;case 2:depends.push("scripts/tvupcoming");break;case 3:depends.push("scripts/tvshows");break;case 4:depends.push("scripts/tvgenres");break;case 5:depends.push("scripts/tvstudios");break;case 6:depends.push("scripts/episodes")}require(depends,function(controllerFactory){var tabContent;0==index&&(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),self.tabContent=tabContent);var controller=tabControllers[index];controller||(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),controller=index?new controllerFactory(view,params,tabContent):self,tabControllers[index]=controller,controller.initTab&&controller.initTab()),callback(controller)})}function preLoadTab(page,index){getTabController(page,index,function(controller){renderedTabs.indexOf(index)==-1&&controller.preRender&&controller.preRender()})}function loadTab(page,index){getTabController(page,index,function(controller){renderedTabs.indexOf(index)==-1&&(renderedTabs.push(index),controller.renderTab())})}function onPlaybackStop(e,state){state.NowPlayingItem&&"Video"==state.NowPlayingItem.MediaType&&(renderedTabs=[],viewTabs.triggerTabChange())}function onWebSocketMessage(e,data){var msg=data;"UserDataChanged"===msg.MessageType&&msg.Data.UserId==Dashboard.getCurrentUserId()&&(renderedTabs=[])}var self=this;self.initTab=function(){var tabContent=self.tabContent,resumableItemsContainer=tabContent.querySelector("#resumableItems");enableScrollX()?(resumableItemsContainer.classList.add("hiddenScrollX"),resumableItemsContainer.classList.remove("vertical-wrap")):(resumableItemsContainer.classList.remove("hiddenScrollX"),resumableItemsContainer.classList.add("vertical-wrap")),categorysyncbuttons.init(tabContent)},self.renderTab=function(){reload()};var tabControllers=[],renderedTabs=[],viewTabs=view.querySelector(".libraryViewNav");enableScrollX()?view.querySelector("#resumableItems").classList.add("hiddenScrollX"):view.querySelector("#resumableItems").classList.remove("hiddenScrollX"),libraryBrowser.configurePaperLibraryTabs(view,viewTabs,view.querySelectorAll(".pageTabContent"),[0,1,2,4,5,6]),viewTabs.addEventListener("beforetabchange",function(e){preLoadTab(view,parseInt(e.detail.selectedTabIndex))}),viewTabs.addEventListener("tabchange",function(e){loadTab(view,parseInt(e.detail.selectedTabIndex))}),view.addEventListener("viewbeforeshow",function(e){if(!view.getAttribute("data-title")){var parentId=params.topParentId;parentId?ApiClient.getItem(Dashboard.getCurrentUserId(),parentId).then(function(item){view.setAttribute("data-title",item.Name),LibraryMenu.setTitle(item.Name)}):(view.setAttribute("data-title",Globalize.translate("TabShows")),LibraryMenu.setTitle(Globalize.translate("TabShows")))}Events.on(MediaController,"playbackstop",onPlaybackStop),Events.on(ApiClient,"websocketmessage",onWebSocketMessage)}),view.addEventListener("viewbeforehide",function(e){Events.off(MediaController,"playbackstop",onPlaybackStop),Events.off(ApiClient,"websocketmessage",onWebSocketMessage)}),require(["headroom-window"],function(headroom){headroom.add(viewTabs),self.headroom=headroom}),view.addEventListener("viewdestroy",function(e){self.headroom&&self.headroom.remove(viewTabs),tabControllers.forEach(function(t){t.destroy&&t.destroy()})})}});