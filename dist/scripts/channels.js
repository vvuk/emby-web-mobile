define(["libraryBrowser","cardBuilder","imageLoader","emby-itemscontainer","emby-tabs","emby-button","scripts/channelslatest","scripts/sections"],function(libraryBrowser,cardBuilder,imageLoader){"use strict";function reloadItems(page){Dashboard.showLoadingMsg(),query.UserId=Dashboard.getCurrentUserId(),ApiClient.getJSON(ApiClient.getUrl("Channels",query)).then(function(result){window.scrollTo(0,0);var html="",view="Thumb";"Thumb"==view?html=cardBuilder.getCardsHtml({items:result.Items,shape:"backdrop",context:"channels",showTitle:!0,lazy:!0,centerText:!0,preferThumb:!0}):"ThumbCard"==view&&(html=cardBuilder.getCardsHtml({items:result.Items,shape:"backdrop",preferThumb:!0,context:"channels",lazy:!0,cardLayout:!0,showTitle:!0}));var elem=page.querySelector("#items");elem.innerHTML=html,imageLoader.lazyChildren(elem),libraryBrowser.saveQueryValues("channels",query),Dashboard.hideLoadingMsg()})}function loadTab(page,index){switch(index){case 1:libraryBrowser.loadSavedQueryValues("channels",query),reloadItems(page)}}var query={StartIndex:0};return function(view,params){var self=this,viewTabs=view.querySelector(".libraryViewNav");libraryBrowser.configurePaperLibraryTabs(view,viewTabs,view.querySelectorAll(".pageTabContent"),[0,1]),viewTabs.addEventListener("tabchange",function(e){loadTab(view,parseInt(e.detail.selectedTabIndex))}),require(["headroom-window"],function(headroom){headroom.add(viewTabs),self.headroom=headroom}),view.addEventListener("viewdestroy",function(e){self.headroom&&self.headroom.remove(viewTabs)})}});