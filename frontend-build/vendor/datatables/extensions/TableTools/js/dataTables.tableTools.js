var TableTools;!function(e,t,s){var n=function(s,n){"use strict";var o={version:"1.0.4-TableTools2",clients:{},moviePath:"",nextId:1,$:function(e){return"string"==typeof e&&(e=t.getElementById(e)),e.addClass||(e.hide=function(){this.style.display="none"},e.show=function(){this.style.display=""},e.addClass=function(e){this.removeClass(e),this.className+=" "+e},e.removeClass=function(e){this.className=this.className.replace(new RegExp("\\s*"+e+"\\s*")," ").replace(/^\s+/,"").replace(/\s+$/,"")},e.hasClass=function(e){return!!this.className.match(new RegExp("\\s*"+e+"\\s*"))}),e},setMoviePath:function(e){this.moviePath=e},dispatch:function(e,t,s){var n=this.clients[e];n&&n.receiveEvent(t,s)},register:function(e,t){this.clients[e]=t},getDOMObjectPosition:function(e){var t={left:0,top:0,width:e.width?e.width:e.offsetWidth,height:e.height?e.height:e.offsetHeight};for(""!==e.style.width&&(t.width=e.style.width.replace("px","")),""!==e.style.height&&(t.height=e.style.height.replace("px",""));e;)t.left+=e.offsetLeft,t.top+=e.offsetTop,e=e.offsetParent;return t},Client:function(e){this.handlers={},this.id=o.nextId++,this.movieId="ZeroClipboard_TableToolsMovie_"+this.id,o.register(this.id,this),e&&this.glue(e)}};return o.Client.prototype={id:0,ready:!1,movie:null,clipText:"",fileName:"",action:"copy",handCursorEnabled:!0,cssEffects:!0,handlers:null,sized:!1,glue:function(e,s){this.domElement=o.$(e);var n=99;this.domElement.style.zIndex&&(n=parseInt(this.domElement.style.zIndex,10)+1);var l=o.getDOMObjectPosition(this.domElement);this.div=t.createElement("div");var i=this.div.style;i.position="absolute",i.left="0px",i.top="0px",i.width=l.width+"px",i.height=l.height+"px",i.zIndex=n,void 0!==s&&""!==s&&(this.div.title=s),0!==l.width&&0!==l.height&&(this.sized=!0),this.domElement&&(this.domElement.appendChild(this.div),this.div.innerHTML=this.getHTML(l.width,l.height).replace(/&/g,"&amp;"))},positionElement:function(){var e=o.getDOMObjectPosition(this.domElement),t=this.div.style;if(t.position="absolute",t.width=e.width+"px",t.height=e.height+"px",0!==e.width&&0!==e.height){this.sized=!0;var s=this.div.childNodes[0];s.width=e.width,s.height=e.height}},getHTML:function(e,t){var s="",n="id="+this.id+"&width="+e+"&height="+t;navigator.userAgent.match(/MSIE/)?s+='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="'+(location.href.match(/^https/i)?"https://":"http://")+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="'+e+'" height="'+t+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+o.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+n+'"/><param name="wmode" value="transparent"/></object>':s+='<embed id="'+this.movieId+'" src="'+o.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+e+'" height="'+t+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+n+'" wmode="transparent" />';return s},hide:function(){this.div&&(this.div.style.left="-2000px")},show:function(){this.reposition()},destroy:function(){if(this.domElement&&this.div){this.hide(),this.div.innerHTML="";var e=t.getElementsByTagName("body")[0];try{e.removeChild(this.div)}catch(e){}this.domElement=null,this.div=null}},reposition:function(e){if(e&&(this.domElement=o.$(e),this.domElement||this.hide()),this.domElement&&this.div){var t=o.getDOMObjectPosition(this.domElement),s=this.div.style;s.left=t.left+"px",s.top=t.top+"px"}},clearText:function(){this.clipText="",this.ready&&this.movie.clearText()},appendText:function(e){this.clipText+=e,this.ready&&this.movie.appendText(e)},setText:function(e){this.clipText=e,this.ready&&this.movie.setText(e)},setCharSet:function(e){this.charSet=e,this.ready&&this.movie.setCharSet(e)},setBomInc:function(e){this.incBom=e,this.ready&&this.movie.setBomInc(e)},setFileName:function(e){this.fileName=e,this.ready&&this.movie.setFileName(e)},setAction:function(e){this.action=e,this.ready&&this.movie.setAction(e)},addEventListener:function(e,t){e=e.toString().toLowerCase().replace(/^on/,""),this.handlers[e]||(this.handlers[e]=[]),this.handlers[e].push(t)},setHandCursor:function(e){this.handCursorEnabled=e,this.ready&&this.movie.setHandCursor(e)},setCSSEffects:function(e){this.cssEffects=!!e},receiveEvent:function(s,n){var o;switch(s=s.toString().toLowerCase().replace(/^on/,"")){case"load":if(this.movie=t.getElementById(this.movieId),!this.movie)return o=this,void setTimeout(function(){o.receiveEvent("load",null)},1);if(!this.ready&&navigator.userAgent.match(/Firefox/)&&navigator.userAgent.match(/Windows/))return o=this,setTimeout(function(){o.receiveEvent("load",null)},100),void(this.ready=!0);this.ready=!0,this.movie.clearText(),this.movie.appendText(this.clipText),this.movie.setFileName(this.fileName),this.movie.setAction(this.action),this.movie.setCharSet(this.charSet),this.movie.setBomInc(this.incBom),this.movie.setHandCursor(this.handCursorEnabled);break;case"mouseover":this.domElement&&this.cssEffects&&this.recoverActive&&this.domElement.addClass("active");break;case"mouseout":this.domElement&&this.cssEffects&&(this.recoverActive=!1,this.domElement.hasClass("active")&&(this.domElement.removeClass("active"),this.recoverActive=!0));break;case"mousedown":this.domElement&&this.cssEffects&&this.domElement.addClass("active");break;case"mouseup":this.domElement&&this.cssEffects&&(this.domElement.removeClass("active"),this.recoverActive=!1)}if(this.handlers[s])for(var l=0,i=this.handlers[s].length;l<i;l++){var a=this.handlers[s][l];"function"==typeof a?a(this,n):"object"==typeof a&&2==a.length?a[0][a[1]](this,n):"string"==typeof a&&e[a](this,n)}}},e.ZeroClipboard_TableTools=o,function(e,t,s){(TableTools=function(t,s){!this instanceof TableTools&&alert("Warning: TableTools must be initialised with the keyword 'new'");var n=e.fn.dataTable.Api?new e.fn.dataTable.Api(t).settings()[0]:t.fnSettings();return this.s={that:this,dt:n,print:{saveStart:-1,saveLength:-1,saveScroll:-1,funcEnd:function(){}},buttonCounter:0,select:{type:"",selected:[],preRowSelect:null,postSelected:null,postDeselected:null,all:!1,selectedClass:""},custom:{},swfPath:"",buttonSet:[],master:!1,tags:{}},this.dom={container:null,table:null,print:{hidden:[],message:null},collection:{collection:null,background:null}},this.classes=e.extend(!0,{},TableTools.classes),this.s.dt.bJUI&&e.extend(!0,this.classes,TableTools.classes_themeroller),this.fnSettings=function(){return this.s},void 0===s&&(s={}),TableTools._aInstances.push(this),this._fnConstruct(s),this}).prototype={fnGetSelected:function(e){var t,s,n=[],o=this.s.dt.aoData,l=this.s.dt.aiDisplay;if(e)for(t=0,s=l.length;t<s;t++)o[l[t]]._DTTT_selected&&n.push(o[l[t]].nTr);else for(t=0,s=o.length;t<s;t++)o[t]._DTTT_selected&&n.push(o[t].nTr);return n},fnGetSelectedData:function(){var e,t,s=[],n=this.s.dt.aoData;for(e=0,t=n.length;e<t;e++)n[e]._DTTT_selected&&s.push(this.s.dt.oInstance.fnGetData(e));return s},fnGetSelectedIndexes:function(e){var t,s,n=[],o=this.s.dt.aoData,l=this.s.dt.aiDisplay;if(e)for(t=0,s=l.length;t<s;t++)o[l[t]]._DTTT_selected&&n.push(l[t]);else for(t=0,s=o.length;t<s;t++)o[t]._DTTT_selected&&n.push(t);return n},fnIsSelected:function(e){var t=this.s.dt.oInstance.fnGetPosition(e);return!0===this.s.dt.aoData[t]._DTTT_selected},fnSelectAll:function(e){this._fnRowSelect(e?this.s.dt.aiDisplay:this.s.dt.aoData)},fnSelectNone:function(e){this._fnRowDeselect(this.fnGetSelectedIndexes(e))},fnSelect:function(e){"single"==this.s.select.type?(this.fnSelectNone(),this._fnRowSelect(e)):this._fnRowSelect(e)},fnDeselect:function(e){this._fnRowDeselect(e)},fnGetTitle:function(e){var t="";if(void 0!==e.sTitle&&""!==e.sTitle)t=e.sTitle;else{var n=s.getElementsByTagName("title");n.length>0&&(t=n[0].innerHTML)}return"¡".toString().length<4?t.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g,""):t.replace(/[^a-zA-Z0-9_\.,\-_ !\(\)]/g,"")},fnCalcColRatios:function(e){var t,s,n=this.s.dt.aoColumns,o=this._fnColumnTargets(e.mColumns),l=[],i=0,a=0;for(t=0,s=o.length;t<s;t++)o[t]&&(a+=i=n[t].nTh.offsetWidth,l.push(i));for(t=0,s=l.length;t<s;t++)l[t]=l[t]/a;return l.join("\t")},fnGetTableData:function(e){if(this.s.dt)return this._fnGetDataTablesData(e)},fnSetText:function(e,t){this._fnFlashSetText(e,t)},fnResizeButtons:function(){for(var e in o.clients)if(e){var t=o.clients[e];void 0!==t.domElement&&t.domElement.parentNode&&t.positionElement()}},fnResizeRequired:function(){for(var e in o.clients)if(e){var t=o.clients[e];if(void 0!==t.domElement&&t.domElement.parentNode==this.dom.container&&!1===t.sized)return!0}return!1},fnPrint:function(e,t){void 0===t&&(t={}),void 0===e||e?this._fnPrintStart(t):this._fnPrintEnd()},fnInfo:function(t,s){var n=e("<div/>").addClass(this.classes.print.info).html(t).appendTo("body");setTimeout(function(){n.fadeOut("normal",function(){n.remove()})},s)},fnContainer:function(){return this.dom.container},_fnConstruct:function(t){var n=this;this._fnCustomiseSettings(t),this.dom.container=s.createElement(this.s.tags.container),this.dom.container.className=this.classes.container,"none"!=this.s.select.type&&this._fnRowSelectConfig(),this._fnButtonDefinations(this.s.buttonSet,this.dom.container),this.s.dt.aoDestroyCallback.push({sName:"TableTools",fn:function(){e(n.s.dt.nTBody).off("click.DTTT_Select","tr"),e(n.dom.container).empty();var t=e.inArray(n,TableTools._aInstances);-1!==t&&TableTools._aInstances.splice(t,1)}})},_fnCustomiseSettings:function(t){void 0===this.s.dt._TableToolsInit&&(this.s.master=!0,this.s.dt._TableToolsInit=!0),this.dom.table=this.s.dt.nTable,this.s.custom=e.extend({},TableTools.DEFAULTS,t),this.s.swfPath=this.s.custom.sSwfPath,void 0!==o&&(o.moviePath=this.s.swfPath),this.s.select.type=this.s.custom.sRowSelect,this.s.select.preRowSelect=this.s.custom.fnPreRowSelect,this.s.select.postSelected=this.s.custom.fnRowSelected,this.s.select.postDeselected=this.s.custom.fnRowDeselected,this.s.custom.sSelectedClass&&(this.classes.select.row=this.s.custom.sSelectedClass),this.s.tags=this.s.custom.oTags,this.s.buttonSet=this.s.custom.aButtons},_fnButtonDefinations:function(t,s){for(var n,o=0,l=t.length;o<l;o++){if("string"==typeof t[o]){if(void 0===TableTools.BUTTONS[t[o]]){alert("TableTools: Warning - unknown button type: "+t[o]);continue}n=e.extend({},TableTools.BUTTONS[t[o]],!0)}else{if(void 0===TableTools.BUTTONS[t[o].sExtends]){alert("TableTools: Warning - unknown button type: "+t[o].sExtends);continue}var i=e.extend({},TableTools.BUTTONS[t[o].sExtends],!0);n=e.extend(i,t[o],!0)}var a=this._fnCreateButton(n,e(s).hasClass(this.classes.collection.container));a&&s.appendChild(a)}},_fnCreateButton:function(t,s){var n=this._fnButtonBase(t,s);if(t.sAction.match(/flash/)){if(!this._fnHasFlash())return!1;this._fnFlashConfig(n,t)}else"text"==t.sAction?this._fnTextConfig(n,t):"div"==t.sAction?this._fnTextConfig(n,t):"collection"==t.sAction&&(this._fnTextConfig(n,t),this._fnCollectionConfig(n,t));return-1!==this.s.dt.iTabIndex&&e(n).attr("tabindex",this.s.dt.iTabIndex).attr("aria-controls",this.s.dt.sTableId).on("keyup.DTTT",function(t){13===t.keyCode&&(t.stopPropagation(),e(this).trigger("click"))}).on("mousedown.DTTT",function(e){t.sAction.match(/flash/)||e.preventDefault()}),n},_fnButtonBase:function(e,t){var n,o,l;t?(n=e.sTag&&"default"!==e.sTag?e.sTag:this.s.tags.collection.button,o=e.sLinerTag&&"default"!==e.sLinerTag?e.sLiner:this.s.tags.collection.liner,l=this.classes.collection.buttons.normal):(n=e.sTag&&"default"!==e.sTag?e.sTag:this.s.tags.button,o=e.sLinerTag&&"default"!==e.sLinerTag?e.sLiner:this.s.tags.liner,l=this.classes.buttons.normal);var i=s.createElement(n),a=s.createElement(o),c=this._fnGetMasterSettings();return i.className=l+" "+e.sButtonClass,i.setAttribute("id","ToolTables_"+this.s.dt.sInstance+"_"+c.buttonCounter),i.appendChild(a),a.innerHTML=e.sButtonText,c.buttonCounter++,i},_fnGetMasterSettings:function(){if(this.s.master)return this.s;for(var e=TableTools._aInstances,t=0,s=e.length;t<s;t++)if(this.dom.table==e[t].s.dt.nTable)return e[t].s},_fnCollectionConfig:function(e,t){var n=s.createElement(this.s.tags.collection.container);n.style.display="none",n.className=this.classes.collection.container,t._collection=n,s.body.appendChild(n),this._fnButtonDefinations(t.aButtons,n)},_fnCollectionShow:function(n,o){var l=this,i=e(n).offset(),a=o._collection,c=i.left,r=i.top+e(n).outerHeight(),h=e(t).height(),f=e(s).height(),d=e(t).width(),u=e(s).width();a.style.position="absolute",a.style.left=c+"px",a.style.top=r+"px",a.style.display="block",e(a).css("opacity",0);var T=s.createElement("div");T.style.position="absolute",T.style.left="0px",T.style.top="0px",T.style.height=(h>f?h:f)+"px",T.style.width=(d>u?d:u)+"px",T.className=this.classes.collection.background,e(T).css("opacity",0),s.body.appendChild(T),s.body.appendChild(a);var p=e(a).outerWidth(),b=e(a).outerHeight();c+p>u&&(a.style.left=u-p+"px"),r+b>f&&(a.style.top=r-b-e(n).outerHeight()+"px"),this.dom.collection.collection=a,this.dom.collection.background=T,setTimeout(function(){e(a).animate({opacity:1},500),e(T).animate({opacity:.25},500)},10),this.fnResizeButtons(),e(T).click(function(){l._fnCollectionHide.call(l,null,null)})},_fnCollectionHide:function(t,s){null!==s&&"collection"==s.sExtends||null!==this.dom.collection.collection&&(e(this.dom.collection.collection).animate({opacity:0},500,function(e){this.style.display="none"}),e(this.dom.collection.background).animate({opacity:0},500,function(e){this.parentNode.removeChild(this)}),this.dom.collection.collection=null,this.dom.collection.background=null)},_fnRowSelectConfig:function(){if(this.s.master){var t=this,s=this.s.dt;this.s.dt.aoOpenRows;e(s.nTable).addClass(this.classes.select.table),"os"===this.s.select.type&&(e(s.nTBody).on("mousedown.DTTT_Select","tr",function(t){t.shiftKey&&e(s.nTBody).css("-moz-user-select","none").one("selectstart.DTTT_Select","tr",function(){return!1})}),e(s.nTBody).on("mouseup.DTTT_Select","tr",function(t){e(s.nTBody).css("-moz-user-select","")})),e(s.nTBody).on("click.DTTT_Select",this.s.custom.sRowSelector,function(n){var o="tr"===this.nodeName.toLowerCase()?this:e(this).parents("tr")[0],l=t.s.select,i=t.s.dt.oInstance.fnGetPosition(o);if(o.parentNode==s.nTBody&&null!==s.oInstance.fnGetData(o)){if("os"==l.type)if(n.ctrlKey||n.metaKey)t.fnIsSelected(o)?t._fnRowDeselect(o,n):t._fnRowSelect(o,n);else if(n.shiftKey){var a=t.s.dt.aiDisplay.slice(),c=e.inArray(l.lastRow,a),r=e.inArray(i,a);if(0===t.fnGetSelected().length||-1===c)a.splice(e.inArray(i,a)+1,a.length);else{if(c>r){var h=r;r=c,c=h}a.splice(r+1,a.length),a.splice(0,c)}t.fnIsSelected(o)?(a.splice(e.inArray(i,a),1),t._fnRowDeselect(a,n)):t._fnRowSelect(a,n)}else t.fnIsSelected(o)&&1===t.fnGetSelected().length?t._fnRowDeselect(o,n):(t.fnSelectNone(),t._fnRowSelect(o,n));else t.fnIsSelected(o)?t._fnRowDeselect(o,n):"single"==l.type?(t.fnSelectNone(),t._fnRowSelect(o,n)):"multi"==l.type&&t._fnRowSelect(o,n);l.lastRow=i}}),s.oApi._fnCallbackReg(s,"aoRowCreatedCallback",function(n,o,l){s.aoData[l]._DTTT_selected&&e(n).addClass(t.classes.select.row)},"TableTools-SelectAll")}},_fnRowSelect:function(t,s){var n,o,l=this._fnSelectData(t),i=(0===l.length||l[0].nTr,[]);for(n=0,o=l.length;n<o;n++)l[n].nTr&&i.push(l[n].nTr);if(null===this.s.select.preRowSelect||this.s.select.preRowSelect.call(this,s,i,!0)){for(n=0,o=l.length;n<o;n++)l[n]._DTTT_selected=!0,l[n].nTr&&e(l[n].nTr).addClass(this.classes.select.row);null!==this.s.select.postSelected&&this.s.select.postSelected.call(this,i),TableTools._fnEventDispatch(this,"select",i,!0)}},_fnRowDeselect:function(t,s){var n,o,l=this._fnSelectData(t),i=(0===l.length||l[0].nTr,[]);for(n=0,o=l.length;n<o;n++)l[n].nTr&&i.push(l[n].nTr);if(null===this.s.select.preRowSelect||this.s.select.preRowSelect.call(this,s,i,!1)){for(n=0,o=l.length;n<o;n++)l[n]._DTTT_selected=!1,l[n].nTr&&e(l[n].nTr).removeClass(this.classes.select.row);null!==this.s.select.postDeselected&&this.s.select.postDeselected.call(this,i),TableTools._fnEventDispatch(this,"select",i,!1)}},_fnSelectData:function(e){var t,s,n,o=[];if(e.nodeName)t=this.s.dt.oInstance.fnGetPosition(e),o.push(this.s.dt.aoData[t]);else{if(void 0!==e.length){for(s=0,n=e.length;s<n;s++)e[s].nodeName?(t=this.s.dt.oInstance.fnGetPosition(e[s]),o.push(this.s.dt.aoData[t])):"number"==typeof e[s]?o.push(this.s.dt.aoData[e[s]]):o.push(e[s]);return o}o.push(e)}return o},_fnTextConfig:function(t,s){var n=this;null!==s.fnInit&&s.fnInit.call(this,t,s),""!==s.sToolTip&&(t.title=s.sToolTip),e(t).hover(function(){null!==s.fnMouseover&&s.fnMouseover.call(this,t,s,null)},function(){null!==s.fnMouseout&&s.fnMouseout.call(this,t,s,null)}),null!==s.fnSelect&&TableTools._fnEventListen(this,"select",function(e){s.fnSelect.call(n,t,s,e)}),e(t).click(function(e){null!==s.fnClick&&s.fnClick.call(n,t,s,null,e),null!==s.fnComplete&&s.fnComplete.call(n,t,s,null,null),n._fnCollectionHide(t,s)})},_fnHasFlash:function(){try{if(new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))return!0}catch(e){if(navigator.mimeTypes&&void 0!==navigator.mimeTypes["application/x-shockwave-flash"]&&navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin)return!0}return!1},_fnFlashConfig:function(e,t){var s=this,n=new o.Client;null!==t.fnInit&&t.fnInit.call(this,e,t),n.setHandCursor(!0),"flash_save"==t.sAction?(n.setAction("save"),n.setCharSet("utf16le"==t.sCharSet?"UTF16LE":"UTF8"),n.setBomInc(t.bBomInc),n.setFileName(t.sFileName.replace("*",this.fnGetTitle(t)))):"flash_pdf"==t.sAction?(n.setAction("pdf"),n.setFileName(t.sFileName.replace("*",this.fnGetTitle(t)))):n.setAction("copy"),n.addEventListener("mouseOver",function(o){null!==t.fnMouseover&&t.fnMouseover.call(s,e,t,n)}),n.addEventListener("mouseOut",function(o){null!==t.fnMouseout&&t.fnMouseout.call(s,e,t,n)}),n.addEventListener("mouseDown",function(o){null!==t.fnClick&&t.fnClick.call(s,e,t,n)}),n.addEventListener("complete",function(o,l){null!==t.fnComplete&&t.fnComplete.call(s,e,t,n,l),s._fnCollectionHide(e,t)}),this._fnFlashGlue(n,e,t.sToolTip)},_fnFlashGlue:function(e,t,n){var o=this,l=t.getAttribute("id");s.getElementById(l)?e.glue(t,n):setTimeout(function(){o._fnFlashGlue(e,t,n)},100)},_fnFlashSetText:function(e,t){var s=this._fnChunkData(t,8192);e.clearText();for(var n=0,o=s.length;n<o;n++)e.appendText(s[n])},_fnColumnTargets:function(t){var s,n,o=[],l=this.s.dt,i=l.aoColumns,a=i.length;if("function"==typeof t){var c=t.call(this,l);for(s=0,n=a;s<n;s++)o.push(-1!==e.inArray(s,c))}else if("object"==typeof t){for(s=0,n=a;s<n;s++)o.push(!1);for(s=0,n=t.length;s<n;s++)o[t[s]]=!0}else if("visible"==t)for(s=0,n=a;s<n;s++)o.push(!!i[s].bVisible);else if("hidden"==t)for(s=0,n=a;s<n;s++)o.push(!i[s].bVisible);else if("sortable"==t)for(s=0,n=a;s<n;s++)o.push(!!i[s].bSortable);else for(s=0,n=a;s<n;s++)o.push(!0);return o},_fnNewline:function(e){return"auto"==e.sNewLine?navigator.userAgent.match(/Windows/)?"\r\n":"\n":e.sNewLine},_fnGetDataTablesData:function(t){var s,o,l,i,a,c,r,h,f=[],d="",u=this.s.dt,T=new RegExp(t.sFieldBoundary,"g"),p=this._fnColumnTargets(t.mColumns),b=void 0!==t.bSelectedOnly&&t.bSelectedOnly;if(t.bHeader){for(a=[],s=0,o=u.aoColumns.length;s<o;s++)p[s]&&(d=u.aoColumns[s].sTitle.replace(/\n/g," ").replace(/<.*?>/g,"").replace(/^\s+|\s+$/g,""),d=this._fnHtmlDecode(d),a.push(this._fnBoundData(d,t.sFieldBoundary,T)));f.push(a.join(t.sFieldSeperator))}b=!0;var m=this.fnGetSelectedIndexes();for(l=0,i=(h=(b="none"!==this.s.select.type&&b&&0!==m.length)?m:n.Api?new n.Api(u).rows(t.oSelectorOpts).indexes().flatten().toArray():u.oInstance.$("tr",t.oSelectorOpts).map(function(e,t){return u.oInstance.fnGetPosition(t)}).get()).length;l<i;l++){for(r=u.aoData[h[l]].nTr,a=[],s=0,o=u.aoColumns.length;s<o;s++)if(p[s]){var v=u.oApi._fnGetCellData(u,h[l],s,"display");d=(d=t.fnCellRender?t.fnCellRender(v,s,r,h[l])+"":"string"==typeof v?(d=(d=v.replace(/\n/g," ")).replace(/<img.*?\s+alt\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+)).*?>/gi,"$1$2$3")).replace(/<.*?>/g,""):v+"").replace(/^\s+/,"").replace(/\s+$/,""),d=this._fnHtmlDecode(d),a.push(this._fnBoundData(d,t.sFieldBoundary,T))}f.push(a.join(t.sFieldSeperator)),t.bOpenRows&&1===(c=e.grep(u.aoOpenRows,function(e){return e.nParent===r})).length&&(d=this._fnBoundData(e("td",c[0].nTr).html(),t.sFieldBoundary,T),f.push(d))}if(t.bFooter&&null!==u.nTFoot){for(a=[],s=0,o=u.aoColumns.length;s<o;s++)p[s]&&null!==u.aoColumns[s].nTf&&(d=u.aoColumns[s].nTf.innerHTML.replace(/\n/g," ").replace(/<.*?>/g,""),d=this._fnHtmlDecode(d),a.push(this._fnBoundData(d,t.sFieldBoundary,T)));f.push(a.join(t.sFieldSeperator))}return f.join(this._fnNewline(t))},_fnBoundData:function(e,t,s){return""===t?e:t+e.replace(s,t+t)+t},_fnChunkData:function(e,t){for(var s=[],n=e.length,o=0;o<n;o+=t)o+t<n?s.push(e.substring(o,o+t)):s.push(e.substring(o,n));return s},_fnHtmlDecode:function(e){if(-1===e.indexOf("&"))return e;var t=s.createElement("div");return e.replace(/&([^\s]*?);/g,function(e,s){return"#"===e.substr(1,1)?String.fromCharCode(Number(s.substr(1))):(t.innerHTML=e,t.childNodes[0].nodeValue)})},_fnPrintStart:function(n){var o=this,l=this.s.dt;this._fnPrintHideNodes(l.nTable),this.s.print.saveStart=l._iDisplayStart,this.s.print.saveLength=l._iDisplayLength,n.bShowAll&&(l._iDisplayStart=0,l._iDisplayLength=-1,l.oApi._fnCalculateEnd&&l.oApi._fnCalculateEnd(l),l.oApi._fnDraw(l)),""===l.oScroll.sX&&""===l.oScroll.sY||(this._fnPrintScrollStart(l),e(this.s.dt.nTable).bind("draw.DTTT_Print",function(){o._fnPrintScrollStart(l)}));var i=l.aanFeatures;for(var a in i)if("i"!=a&&"t"!=a&&1==a.length)for(var c=0,r=i[a].length;c<r;c++)this.dom.print.hidden.push({node:i[a][c],display:"block"}),i[a][c].style.display="none";e(s.body).addClass(this.classes.print.body),""!==n.sInfo&&this.fnInfo(n.sInfo,3e3),n.sMessage&&e("<div/>").addClass(this.classes.print.message).html(n.sMessage).prependTo("body"),this.s.print.saveScroll=e(t).scrollTop(),t.scrollTo(0,0),e(s).bind("keydown.DTTT",function(e){27==e.keyCode&&(e.preventDefault(),o._fnPrintEnd.call(o,e))})},_fnPrintEnd:function(n){var o=this.s.dt,l=this.s.print;this.dom.print;this._fnPrintShowNodes(),""===o.oScroll.sX&&""===o.oScroll.sY||(e(this.s.dt.nTable).unbind("draw.DTTT_Print"),this._fnPrintScrollEnd()),t.scrollTo(0,l.saveScroll),e("div."+this.classes.print.message).remove(),e(s.body).removeClass("DTTT_Print"),o._iDisplayStart=l.saveStart,o._iDisplayLength=l.saveLength,o.oApi._fnCalculateEnd&&o.oApi._fnCalculateEnd(o),o.oApi._fnDraw(o),e(s).unbind("keydown.DTTT")},_fnPrintScrollStart:function(){var t,s,n=this.s.dt,o=(n.nScrollHead.getElementsByTagName("div")[0].getElementsByTagName("table")[0],n.nTable.parentNode);(t=n.nTable.getElementsByTagName("thead")).length>0&&n.nTable.removeChild(t[0]),null!==n.nTFoot&&(s=n.nTable.getElementsByTagName("tfoot")).length>0&&n.nTable.removeChild(s[0]),t=n.nTHead.cloneNode(!0),n.nTable.insertBefore(t,n.nTable.childNodes[0]),null!==n.nTFoot&&(s=n.nTFoot.cloneNode(!0),n.nTable.insertBefore(s,n.nTable.childNodes[1])),""!==n.oScroll.sX&&(n.nTable.style.width=e(n.nTable).outerWidth()+"px",o.style.width=e(n.nTable).outerWidth()+"px",o.style.overflow="visible"),""!==n.oScroll.sY&&(o.style.height=e(n.nTable).outerHeight()+"px",o.style.overflow="visible")},_fnPrintScrollEnd:function(){var e=this.s.dt,t=e.nTable.parentNode;""!==e.oScroll.sX&&(t.style.width=e.oApi._fnStringToCss(e.oScroll.sX),t.style.overflow="auto"),""!==e.oScroll.sY&&(t.style.height=e.oApi._fnStringToCss(e.oScroll.sY),t.style.overflow="auto")},_fnPrintShowNodes:function(){for(var e=this.dom.print.hidden,t=0,s=e.length;t<s;t++)e[t].node.style.display=e[t].display;e.splice(0,e.length)},_fnPrintHideNodes:function(t){for(var s=this.dom.print.hidden,n=t.parentNode,o=n.childNodes,l=0,i=o.length;l<i;l++)if(o[l]!=t&&1==o[l].nodeType){var a=e(o[l]).css("display");"none"!=a&&(s.push({node:o[l],display:a}),o[l].style.display="none")}"BODY"!=n.nodeName.toUpperCase()&&this._fnPrintHideNodes(n)}},TableTools._aInstances=[],TableTools._aListeners=[],TableTools.fnGetMasters=function(){for(var e=[],t=0,s=TableTools._aInstances.length;t<s;t++)TableTools._aInstances[t].s.master&&e.push(TableTools._aInstances[t]);return e},TableTools.fnGetInstance=function(e){"object"!=typeof e&&(e=s.getElementById(e));for(var t=0,n=TableTools._aInstances.length;t<n;t++)if(TableTools._aInstances[t].s.master&&TableTools._aInstances[t].dom.table==e)return TableTools._aInstances[t];return null},TableTools._fnEventListen=function(e,t,s){TableTools._aListeners.push({that:e,type:t,fn:s})},TableTools._fnEventDispatch=function(e,t,s,n){for(var o=TableTools._aListeners,l=0,i=o.length;l<i;l++)e.dom.table==o[l].that.dom.table&&o[l].type==t&&o[l].fn(s,n)},TableTools.buttonBase={sAction:"text",sTag:"default",sLinerTag:"default",sButtonClass:"DTTT_button_text",sButtonText:"Button text",sTitle:"",sToolTip:"",sCharSet:"utf8",bBomInc:!1,sFileName:"*.csv",sFieldBoundary:"",sFieldSeperator:"\t",sNewLine:"auto",mColumns:"all",bHeader:!0,bFooter:!0,bOpenRows:!1,bSelectedOnly:!1,oSelectorOpts:void 0,fnMouseover:null,fnMouseout:null,fnClick:null,fnSelect:null,fnComplete:null,fnInit:null,fnCellRender:null},TableTools.BUTTONS={csv:e.extend({},TableTools.buttonBase,{sAction:"flash_save",sButtonClass:"DTTT_button_csv",sButtonText:"CSV",sFieldBoundary:'"',sFieldSeperator:",",fnClick:function(e,t,s){this.fnSetText(s,this.fnGetTableData(t))}}),xls:e.extend({},TableTools.buttonBase,{sAction:"flash_save",sCharSet:"utf16le",bBomInc:!0,sButtonClass:"DTTT_button_xls",sButtonText:"Excel",fnClick:function(e,t,s){this.fnSetText(s,this.fnGetTableData(t))}}),copy:e.extend({},TableTools.buttonBase,{sAction:"flash_copy",sButtonClass:"DTTT_button_copy",sButtonText:"Copy",fnClick:function(e,t,s){this.fnSetText(s,this.fnGetTableData(t))},fnComplete:function(e,t,s,n){var o=n.split("\n").length;t.bHeader&&o--,null!==this.s.dt.nTFoot&&t.bFooter&&o--;var l=1==o?"":"s";this.fnInfo("<h6>Table copied</h6><p>Copied "+o+" row"+l+" to the clipboard.</p>",1500)}}),pdf:e.extend({},TableTools.buttonBase,{sAction:"flash_pdf",sNewLine:"\n",sFileName:"*.pdf",sButtonClass:"DTTT_button_pdf",sButtonText:"PDF",sPdfOrientation:"portrait",sPdfSize:"A4",sPdfMessage:"",fnClick:function(e,t,s){this.fnSetText(s,"title:"+this.fnGetTitle(t)+"\nmessage:"+t.sPdfMessage+"\ncolWidth:"+this.fnCalcColRatios(t)+"\norientation:"+t.sPdfOrientation+"\nsize:"+t.sPdfSize+"\n--/TableToolsOpts--\n"+this.fnGetTableData(t))}}),print:e.extend({},TableTools.buttonBase,{sInfo:"<h6>Print view</h6><p>Please use your browser's print function to print this table. Press escape when finished.</p>",sMessage:null,bShowAll:!0,sToolTip:"View print view",sButtonClass:"DTTT_button_print",sButtonText:"Print",fnClick:function(e,t){this.fnPrint(!0,t)}}),text:e.extend({},TableTools.buttonBase),select:e.extend({},TableTools.buttonBase,{sButtonText:"Select button",fnSelect:function(t,s){0!==this.fnGetSelected().length?e(t).removeClass(this.classes.buttons.disabled):e(t).addClass(this.classes.buttons.disabled)},fnInit:function(t,s){e(t).addClass(this.classes.buttons.disabled)}}),select_single:e.extend({},TableTools.buttonBase,{sButtonText:"Select button",fnSelect:function(t,s){1==this.fnGetSelected().length?e(t).removeClass(this.classes.buttons.disabled):e(t).addClass(this.classes.buttons.disabled)},fnInit:function(t,s){e(t).addClass(this.classes.buttons.disabled)}}),select_all:e.extend({},TableTools.buttonBase,{sButtonText:"Select all",fnClick:function(e,t){this.fnSelectAll()},fnSelect:function(t,s){this.fnGetSelected().length==this.s.dt.fnRecordsDisplay()?e(t).addClass(this.classes.buttons.disabled):e(t).removeClass(this.classes.buttons.disabled)}}),select_none:e.extend({},TableTools.buttonBase,{sButtonText:"Deselect all",fnClick:function(e,t){this.fnSelectNone()},fnSelect:function(t,s){0!==this.fnGetSelected().length?e(t).removeClass(this.classes.buttons.disabled):e(t).addClass(this.classes.buttons.disabled)},fnInit:function(t,s){e(t).addClass(this.classes.buttons.disabled)}}),ajax:e.extend({},TableTools.buttonBase,{sAjaxUrl:"/xhr.php",sButtonText:"Ajax button",fnClick:function(t,s){var n=this.fnGetTableData(s);e.ajax({url:s.sAjaxUrl,data:[{name:"tableData",value:n}],success:s.fnAjaxComplete,dataType:"json",type:"POST",cache:!1,error:function(){alert("Error detected when sending table data to server")}})},fnAjaxComplete:function(e){alert("Ajax complete")}}),div:e.extend({},TableTools.buttonBase,{sAction:"div",sTag:"div",sButtonClass:"DTTT_nonbutton",sButtonText:"Text button"}),collection:e.extend({},TableTools.buttonBase,{sAction:"collection",sButtonClass:"DTTT_button_collection",sButtonText:"Collection",fnClick:function(e,t){this._fnCollectionShow(e,t)}})},TableTools.buttons=TableTools.BUTTONS,TableTools.classes={container:"DTTT_container",buttons:{normal:"DTTT_button",disabled:"DTTT_disabled"},collection:{container:"DTTT_collection",background:"DTTT_collection_background",buttons:{normal:"DTTT_button",disabled:"DTTT_disabled"}},select:{table:"DTTT_selectable",row:"DTTT_selected selected"},print:{body:"DTTT_Print",info:"DTTT_print_info",message:"DTTT_PrintMessage"}},TableTools.classes_themeroller={container:"DTTT_container ui-buttonset ui-buttonset-multi",buttons:{normal:"DTTT_button ui-button ui-state-default"},collection:{container:"DTTT_collection ui-buttonset ui-buttonset-multi"}},TableTools.DEFAULTS={sSwfPath:"../swf/copy_csv_xls_pdf.swf",sRowSelect:"none",sRowSelector:"tr",sSelectedClass:null,fnPreRowSelect:null,fnRowSelected:null,fnRowDeselected:null,aButtons:["copy","csv","xls","pdf","print"],oTags:{container:"div",button:"a",liner:"span",collection:{container:"div",button:"a",liner:"span"}}},TableTools.defaults=TableTools.DEFAULTS,TableTools.prototype.CLASS="TableTools",TableTools.version="2.2.3",e.fn.dataTable.Api&&e.fn.dataTable.Api.register("tabletools()",function(){var e=null;return this.context.length>0&&(e=TableTools.fnGetInstance(this.context[0].nTable)),e}),"function"==typeof e.fn.dataTable&&"function"==typeof e.fn.dataTableExt.fnVersionCheck&&e.fn.dataTableExt.fnVersionCheck("1.9.0")?e.fn.dataTableExt.aoFeatures.push({fnInit:function(e){var t=e.oInit,s=t&&(t.tableTools||t.oTableTools)||{};return new TableTools(e.oInstance,s).dom.container},cFeature:"T",sFeature:"TableTools"}):alert("Warning: TableTools requires DataTables 1.9.0 or newer - www.datatables.net/download"),e.fn.DataTable.TableTools=TableTools}(jQuery,e,t),"function"==typeof s.fn.dataTable&&"function"==typeof s.fn.dataTableExt.fnVersionCheck&&s.fn.dataTableExt.fnVersionCheck("1.9.0")?s.fn.dataTableExt.aoFeatures.push({fnInit:function(e){var t=void 0!==e.oInit.oTableTools?e.oInit.oTableTools:{},s=new TableTools(e.oInstance,t);return TableTools._aInstances.push(s),s.dom.container},cFeature:"T",sFeature:"TableTools"}):alert("Warning: TableTools 2 requires DataTables 1.9.0 or newer - www.datatables.net/download"),s.fn.dataTable.TableTools=TableTools,s.fn.DataTable.TableTools=TableTools,TableTools};"function"==typeof define&&define.amd?define(["jquery","datatables"],n):"object"==typeof exports?n(require("jquery"),require("datatables")):jQuery&&!jQuery.fn.dataTable.TableTools&&n(jQuery,jQuery.fn.dataTable)}(window,document);