define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,s,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[s](n[r]-t),r in i?i[r]:i.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{shift:function(n){return e.v(n,"shift")+"<br>shift"},line:function(n){return"Line:"},title:function(n){return"Hourly efficiency "+e.v(n,"from")+"-"+e.v(n,"to")},planned:function(n){return"Quantity planned [PCE]"},actual:function(n){return"Quantity done [PCE]"},remaining:function(n){return"Total remaining quantity:"},unit:function(n){return"PCE"},"controls:switchApp":function(n){return"Switch apps/Configure after 3s"},"controls:reboot":function(n){return"Refresh page/Restart after 3s"},"controls:shutdown":function(n){return"Shutdown after 3s"},"snMessage:scannedValue":function(n){return"Scanned value"},"snMessage:orderNo":function(n){return"Order no"},"snMessage:serialNo":function(n){return"Serial no"},"snMessage:UNKNOWN_CODE":function(n){return"The scanned code does not contain a serial number."},"snMessage:INVALID_STATE:idle":function(n){return"Begin an order to enable the SN scanning."},"snMessage:INVALID_STATE:downtime":function(n){return"Finish the downtime to enable SN scanningthe ."},"snMessage:INVALID_ORDER":function(n){return"Scanned SN from a wrong order."},"snMessage:ALREADY_USED":function(n){return"Scanned SN is already registered."},"snMessage:CHECKING":function(n){return"<span class='fa fa-spinner fa-spin'></span><br>Checking the serial number..."},"snMessage:SERVER_FAILURE":function(n){return"Remote server error while checking the serial number."},"snMessage:SHIFT_NOT_FOUND":function(n){return"Line shift not found."},"snMessage:ORDER_NOT_FOUND":function(n){return"Line order not found."},"snMessage:STANDARD_LABEL":function(n){return"The virtual SN cannot be used in this order."},"snMessage:SUCCESS":function(n){return"Serial number successfully registered."}},pl:!0}});