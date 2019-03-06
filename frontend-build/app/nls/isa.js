define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,u,s){return n.c(e,t),e[t]in s?s[e[t]]:(t=n.lc[u](e[t]-r))in s?s[t]:s.other},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"ISA"},"BREADCRUMBS:events":function(e){return"Events"},"BREADCRUMBS:requests":function(e){return"Requests"},"actions:shiftPersonnel":function(e){return"Change available personnel"},"actions:responderFilter":function(e){return"Filter by warehouseman"},"actions:toggleFullscreen":function(e){return"Toggle fullscreen mode"},"actions:toggleHotkeys":function(e){return"Toggle hotkeys visibility"},"actions:showRequests":function(e){return"Show requests"},"actions:collapseEvents":function(e){return"Hide events"},"requests:header":function(e){return"To do"},"requests:empty":function(e){return"There is no requests to do."},"responses:header":function(e){return"In progress"},"responses:empty":function(e){return"There is no requests in progress."},"lineState:header:pickup":function(e){return"pallet pickup"},"lineState:header:delivery":function(e){return"<em>"+n.v(e,"palletKindFull")+"</em> delivery"},"lineState:division":function(e){return"Division"},"lineState:prodFlow":function(e){return"Flow"},"lineState:workCenter":function(e){return"WorkCenter"},"lineState:prodLine":function(e){return"Line"},"lineState:time":function(e){return"Time"},"lineState:whman":function(e){return"Warehouseman"},"pickup:failure":function(e){return"Failed to start the pickup request."},"pickup:LOCKED":function(e){return"Cannot create a new request so soon after the last one!"},"deliver:failure":function(e){return"Failed to start the delivery request."},"deliver:LOCKED":function(e){return"Cannot create a new request so soon after the last one!"},"cancel:action":function(e){return"Cancel request"},"cancel:title":function(e){return"Request cancel"},"cancel:message":function(e){return"Are you sure you want to cancel the request?"},"cancel:yes":function(e){return"Cancel request"},"cancel:no":function(e){return"No, do not cancel"},"cancel:failure":function(e){return"Failed to cancel the request."},"cancel:LOCKED":function(e){return"Cannot cancel a request so soon after it was created!"},"accept:action":function(e){return"Accept request"},"accept:failure":function(e){return"Failed to accept the request."},"accept:UNKNOWN_RESPONDER":function(e){return"Failed to accept the request: unknown user."},"accept:INVALID_RESPONDER":function(e){return"Failed to accept the request: invalid user."},"finish:action":function(e){return"Finish request"},"finish:failure":function(e){return"Failed to finish the request."},"shiftPersonnel:title":function(e){return"Available personnel"},"shiftPersonnel:message":function(e){return"Select warehousemen working on the current work shift:"},"shiftPersonnel:submit":function(e){return"Save personnel"},"shiftPersonnel:msg:failure":function(e){return"Failed to save the available personnel."},"shiftPersonnel:msg:success":function(e){return"Work shift personnel was saved!"},"responderPicker:empty":function(e){return"Shift personnel is not set!"},"events:header":function(e){return"Events"},"events:time":function(e){return"Time"},"events:line":function(e){return"Line"},"events:user":function(e){return"User"},"events:action":function(e){return"Action"},"events:pickupRequested":function(e){return"Pickup requested."},"events:deliveryRequested":function(e){return"Delivery of "+n.v(e,"palletKind->label")+" x"+n.v(e,"qty")+" requested."},"events:requestCancelled":function(e){return"Request cancelled."},"events:requestAccepted":function(e){return"Request accepted by "+n.v(e,"responder->label")+"."},"events:requestFinished":function(e){return"Request finished."},"events:shiftPersonnelUpdated":function(e){return"Work shift personnel changed."},"events:filter":function(e){return"Filter events"},"events:type:pickupRequested":function(e){return"Pickup request"},"events:type:deliveryRequested":function(e){return"Delivery request"},"events:type:requestCancelled":function(e){return"Request cancel"},"events:type:requestAccepted":function(e){return"Request accept"},"events:type:requestFinished":function(e){return"Request finish"},"events:type:shiftPersonnelUpdated":function(e){return"Work shift personnel change"},"requests:filter":function(e){return"Filter requests"},"requests:line":function(e){return"Line"},"requests:type":function(e){return"Type"},"requests:type:pickup":function(e){return"Pickup"},"requests:type:delivery":function(e){return"Delivery of <em>"+n.v(e,"palletKind")+"</em> x"+n.v(e,"qty")},"requests:status":function(e){return"Status"},"requests:status:new":function(e){return"New"},"requests:status:accepted":function(e){return"Accepted"},"requests:status:finished":function(e){return"Finished"},"requests:status:cancelled":function(e){return"Cancelled"},"requests:request":function(e){return"Request"},"requests:response":function(e){return"Response"},"requests:finish":function(e){return"Finish"},"requests:requester":function(e){return"Requester"},"requests:requestedAt":function(e){return"Requested at"},"requests:responder":function(e){return"Warehouseman"},"requests:respondedAt":function(e){return"Accepted at"},"requests:finisher":function(e){return"Finisher"},"requests:finishedAt":function(e){return"Finished at"},"requests:duration":function(e){return"Duration"},"requests:date+user":function(e){return"on "+n.v(e,"date")+" by "+n.v(e,"user")},"requests:time+user":function(e){return"at "+n.v(e,"time")+" by "+n.v(e,"user")},"hotkeys:shiftLeft+n:kbd":function(e){return"Left SHIFT+Number"},"hotkeys:shiftLeft+n:lbl":function(e){return"Accept request"},"hotkeys:altLeft+n:kbd":function(e){return"Left ALT+Number"},"hotkeys:altLeft+n:lbl":function(e){return"Finish request"},"hotkeys:shiftRight+n:kbd":function(e){return"Right SHIFT+Number"},"hotkeys:shiftRight+n:lbl":function(e){return"Cancel To do request"},"hotkeys:altRight+n:kbd":function(e){return"Right ALT+Number"},"hotkeys:altRight+n:lbl":function(e){return"Cancel In progress request"},"hotkeys:p:kbd":function(e){return"P"},"hotkeys:p:lbl":function(e){return"Personnel"},"hotkeys:f:kbd":function(e){return"F"},"hotkeys:f:lbl":function(e){return"Filter"},"msg:whmanNotFound":function(e){return"Warehouseman not found:<br>"+n.v(e,"personnelId")},"msg:noAction":function(e){return"No action for warehouseman:<br>"+n.v(e,"whman")},"msg:accept:failure":function(e){return"Failed to accept the request."},"msg:accept:header":function(e){return n.s(e,"requestType",{delivery:"Pallet delivery",other:"Pallet pickup"})},"msg:finish:failure":function(e){return"Failed to finish the request."},"msg:finish:success":function(e){return"Finish a "+n.s(e,"type",{delivery:"delivery to",other:"pickup from"})+"<br>"+n.v(e,"line")}},pl:!0}});