define(["browser","css!./navdrawer","scrollStyles"],function(browser){return function(options){function onPanStart(ev){options.target.classList.remove("transition"),options.target.classList.add("open"),velocity=Math.abs(ev.velocity)}function onPanMove(ev){velocity=Math.abs(ev.velocity);var isOpen=self.visible;isOpen&&!draggingX&&ev.deltaX>0&&(draggingY=!0),draggingX||draggingY||isOpen&&!(Math.abs(ev.deltaX)>=10)?draggingY||(draggingY=!0):(draggingX=!0,scrollContainer.addEventListener("scroll",disableEvent),self.showMask()),draggingX&&(newPos=currentPos+ev.deltaX,self.changeMenuPos())}function onPanEnd(ev){options.target.classList.add("transition"),scrollContainer.removeEventListener("scroll",disableEvent),draggingX=!1,draggingY=!1,currentPos=ev.deltaX,self.checkMenuState(ev.deltaX,ev.deltaY)}function initEdgeSwipe(Hammer){options.disableEdgeSwipe||require(["hammer-main"],initEdgeSwipeInternal)}function initEdgeSwipeInternal(edgeHammer){var isPeeking=!1;edgeHammer.on("panstart panmove",function(ev){if(isPeeking)onPanMove(ev);else{var srcEvent=ev.srcEvent,clientX=srcEvent.clientX;if(!clientX){var touches=srcEvent.touches;touches&&touches.length&&(clientX=touches[0].clientX)}clientX<=options.handleSize&&(isPeeking=!0,onPanStart(ev))}}),edgeHammer.on("panend pancancel",function(ev){isPeeking&&(isPeeking=!1,onPanEnd(ev))}),self.edgeHammer=edgeHammer}function disableEvent(e){e.preventDefault(),e.stopPropagation()}function initWithHammer(Hammer){Hammer&&(menuHammer=Hammer(options.target,null)),self.initElements(Hammer),Hammer&&(self.touchStartMenu(),self.touchEndMenu(),self.eventStartMask(),self.eventEndMask(),initEdgeSwipe(Hammer)),options.disableMask||self.clickMaskClose()}var self,defaults,mask,maskHammer,menuHammer,newPos=0,currentPos=0,startPoint=0,countStart=0,velocity=0;options.target.classList.add("transition");var draggingX,draggingY,scrollContainer=options.target.querySelector(".scrollContainer");scrollContainer.classList.add("smoothScrollY");var TouchMenuLA=function(){self=this,defaults={width:260,handleSize:30,disableMask:!1,maxMaskOpacity:.5},this.isVisible=!1,this.initialize()};return TouchMenuLA.prototype.initElements=function(Hammer){options.target.classList.add("touch-menu-la"),options.target.style.width=options.width+"px",options.target.style.left=-options.width+"px",options.disableMask||(mask=document.createElement("div"),mask.className="tmla-mask",document.body.appendChild(mask),Hammer&&(maskHammer=new Hammer(mask,null)))},TouchMenuLA.prototype.touchStartMenu=function(){menuHammer.on("panstart",function(ev){onPanStart(ev)}),menuHammer.on("panmove",function(ev){onPanMove(ev)})},TouchMenuLA.prototype.animateToPosition=function(pos){requestAnimationFrame(function(){pos?options.target.style.transform="translate3d("+pos+"px, 0, 0)":options.target.style.transform="none"})},TouchMenuLA.prototype.changeMenuPos=function(){newPos<=options.width&&this.animateToPosition(newPos)},TouchMenuLA.prototype.touchEndMenu=function(){menuHammer.on("panend pancancel",onPanEnd)},TouchMenuLA.prototype.clickMaskClose=function(){mask.addEventListener("click",function(){self.close()})},TouchMenuLA.prototype.checkMenuState=function(deltaX,deltaY){velocity>=1?deltaX>=-80||Math.abs(deltaY)>=70?self.open():self.close():newPos>=100?self.open():self.close()},TouchMenuLA.prototype.open=function(){this.animateToPosition(options.width),currentPos=options.width,this.isVisible=!0,options.target.classList.add("open"),self.showMask(),self.invoke(options.onChange)},TouchMenuLA.prototype.close=function(){this.animateToPosition(0),currentPos=0,self.isVisible=!1,options.target.classList.remove("open"),self.hideMask(),self.invoke(options.onChange)},TouchMenuLA.prototype.toggle=function(){self.isVisible?self.close():self.open()},TouchMenuLA.prototype.eventStartMask=function(){maskHammer.on("panstart panmove",function(ev){ev.center.x<=options.width&&self.isVisible&&(countStart++,1==countStart&&(startPoint=ev.deltaX),ev.deltaX<0&&(draggingX=!0,newPos=ev.deltaX-startPoint+options.width,self.changeMenuPos(),velocity=Math.abs(ev.velocity)))})},TouchMenuLA.prototype.eventEndMask=function(){maskHammer.on("panend pancancel",function(ev){self.checkMenuState(ev.deltaX),countStart=0})},TouchMenuLA.prototype.showMask=function(){mask.classList.add("backdrop")},TouchMenuLA.prototype.hideMask=function(){mask.classList.remove("backdrop")},TouchMenuLA.prototype.invoke=function(fn){fn&&fn.apply(self)},TouchMenuLA.prototype.initialize=function(){options=Object.assign(defaults,options||{}),browser.edge&&(options.disableEdgeSwipe=!0),browser.touch?require(["hammer"],initWithHammer):initWithHammer()},new TouchMenuLA}});