﻿define(['localsync'],function(){function refreshSyncStatus(page){if(LocalSync.isSupported()){var status=LocalSync.getSyncStatus();page.querySelector('.labelSyncStatus').innerHTML=Globalize.translate('LabelLocalSyncStatusValue',status);page.querySelector('.syncSpinner').active=status=="Active";if(status=="Active"){page.querySelector('.btnSyncNow').classList.add('hide');}
else{page.querySelector('.btnSyncNow').classList.remove('hide');}}}
function syncNow(page){LocalSync.sync();require(['toast'],function(toast){toast(Globalize.translate('MessageSyncStarted'));});refreshSyncStatus(page);}
return function(view,params){var interval;view.querySelector('.btnSyncNow').addEventListener('click',function(){syncNow(view);});if(LocalSync.isSupported()){view.querySelector('.localSyncStatus').classList.remove('hide');}else{view.querySelector('.localSyncStatus').classList.add('hide');view.querySelector('.syncSpinner').active=false;}
view.addEventListener('viewbeforeshow',function(){var page=this;refreshSyncStatus(page);interval=setInterval(function(){refreshSyncStatus(page);},5000);});view.addEventListener('viewbeforehide',function(){var page=this;page.querySelector('.syncSpinner').active=false;if(interval){clearInterval(interval);interval=null;}});};});