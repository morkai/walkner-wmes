define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,u,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[u](n[r]-e))in o?o[r]:o.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"BREADCRUMBS:base":function(n){return"SNF"},"BREADCRUMBS:browse":function(n){return"Programs"},"PANEL:TITLE:details":function(n){return"Program details"},"PANEL:TITLE:gallery":function(n){return"Gallery"},"PROPERTY:name":function(n){return"Program name"},"PROPERTY:kind":function(n){return"Program kind"},"PROPERTY:lightSourceType":function(n){return"Light source type"},"PROPERTY:bulbPower":function(n){return"Bulb power"},"PROPERTY:ballast":function(n){return"Ballast"},"PROPERTY:ignitron":function(n){return"Ignitron"},"PROPERTY:lightSensors":function(n){return"Light sensors active?"},"PROPERTY:lampCount":function(n){return"Lamp count"},"PROPERTY:lampBulb":function(n){return"Bulb in lamp?"},"PROPERTY:waitForStartTime":function(n){return"Time to wait for light"},"PROPERTY:illuminationTime":function(n){return"Illumination duration"},"PROPERTY:contactors":function(n){return"Contactors"},"PROPERTY:testerK12":function(n){return"Tester contactor K12 - 100W"},"PROPERTY:ballast400W1":function(n){return"Contactor S6 - Ballast 1 - 400W"},"PROPERTY:ballast400W2":function(n){return"Contactor S7 - Ballast 2 - 400W"},"PROPERTY:ballast2000W":function(n){return"Contactor S8 - Ballast - 2000W"},"PROPERTY:ignitron400W1":function(n){return"Contactor S9 - Ignitron 1 - 400W"},"PROPERTY:ignitron400W2":function(n){return"Contactor S10 - Ignitron 2 - 400W"},"PROPERTY:ignitron2000W":function(n){return"Contactor S11 - Ignitron - 2000W"},"PROPERTY:k15":function(n){return"Lamp contactor K15 - 2000W"},"PROPERTY:k16":function(n){return"Lamp contactor K16 - 1000W"},"PROPERTY:k17":function(n){return"Lamp contactor K17 - E40 <strong>(1)</strong> LEFT"},"PROPERTY:k18":function(n){return"Lamp contactor K18 - E40 <strong>(2)</strong> RIGHT"},"PROPERTY:k19":function(n){return"Lamp contactor K19"},"PROPERTY:k20":function(n){return"Lamp contactor K20"},"PROPERTY:k21":function(n){return"Lamp contactor K21"},"PROPERTY:interlock":function(n){return"Interlock"},"PROPERTY:hrsInterval":function(n){return"HRS interval"},"PROPERTY:hrsTime":function(n){return"HRS duration"},"PROPERTY:hrsCount":function(n){return"HRS repeat count"},"PROPERTY:limitSwitch":function(n){return"Limit switch?"},"PROPERTY:currentBoundries":function(n){return"Current boundaries"},"PROPERTY:minCurrent":function(n){return"Min. current"},"PROPERTY:maxCurrent":function(n){return"Max. current"},"PROPERTY:bulbHolder":function(n){return"Porcelain test?"},"PROPERTY:images.label":function(n){return"Label"},"current:noBoundries":function(n){return"Not checked"},"current:boundries":function(n){return"from <em>"+t.v(n,"min")+"A</em> to <em>"+t.v(n,"max")+"A</em>"},"kind:30s":function(n){return"30 seconds"},"kind:hrs":function(n){return"Hot Restrike"},"kind:tester":function(n){return"Tester"},"lightSourceType:100":function(n){return"HPI"},"lightSourceType:2x100":function(n){return"HPI x2"},"lightSourceType:400":function(n){return"SON"},"lightSourceType:2x400":function(n){return"SON x2"},"lightSourceType:2000":function(n){return"MNH"},"bulbPower:100":function(n){return"100W"},"bulbPower:2x100":function(n){return"100W x2"},"bulbPower:150":function(n){return"150W"},"bulbPower:250":function(n){return"250W"},"bulbPower:2x250":function(n){return"250W x2"},"bulbPower:400":function(n){return"400W"},"bulbPower:2x400":function(n){return"400W x2"},"bulbPower:600":function(n){return"600W"},"bulbPower:2x600":function(n){return"600W x2"},"bulbPower:1000":function(n){return"1000W"},"bulbPower:2000":function(n){return"2000W"},"ballast:400":function(n){return"400W"},"ballast:2x400":function(n){return"400W x2"},"ballast:2000":function(n){return"2000W"},"ignitron:outside":function(n){return"Outside"},"ignitron:fitting":function(n){return"Fitting"},"ignitron:tin":function(n){return"Tin"},"lightSensors:true":function(n){return"On"},"lightSensors:false":function(n){return"Off"},"lampCount:1":function(n){return"Single lamp SON/HPI"},"lampCount:2":function(n){return"Two lamps SON/HPI"},"lampCount:3":function(n){return"Single lamp MNH"},"interlock:1":function(n){return"Connect probe 1"},"interlock:1+2":function(n){return"Disconnect probe 2"},"interlock:mnh":function(n){return"Connect probe MNH"},"gallery:add":function(n){return"Add new images!"},"gallery:delete:title":function(n){return"Deleting image"},"gallery:delete:message":function(n){return"Are you sure you want to delete the selected image?"},"gallery:delete:yes":function(n){return"Delete image"},"gallery:delete:no":function(n){return"Cancel"},"gallery:edit:title":function(n){return"Editing image"},"gallery:edit:submit":function(n){return"Edit image"},"gallery:edit:failure":function(n){return"Failed to edit image label."}},pl:!0}});