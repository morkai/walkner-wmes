define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,i,u){return t.c(n,e),n[e]in u?u[n[e]]:(e=t.lc[i](n[e]-r))in u?u[e]:u.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"BREADCRUMB:base":function(n){return"FAP"},"BREADCRUMB:browse":function(n){return"FAP"},"BREADCRUMB:settings":function(n){return"Settings"},"BREADCRUMB:history":function(n){return"Changelog"},"BREADCRUMB:reports:count":function(n){return"Report"},"PAGE_ACTION:settings":function(n){return"Settings"},"PAGE_ACTION:jump:title":function(n){return"Jump to entry by ID"},"PAGE_ACTION:jump:placeholder":function(n){return"Entry ID"},"PAGE_ACTION:start":function(n){return"Start entry"},"PAGE_ACTION:finish":function(n){return"Finish entry"},"PAGE_ACTION:restart":function(n){return"Restart entry"},"PAGE_ACTION:markAsSeen":function(n){return"Mark as seen"},"PAGE_ACTION:subscribe":function(n){return"Turn on notifications"},"PAGE_ACTION:unsubscribe":function(n){return"Turn off notifications"},"PAGE_ACTION:history":function(n){return"Changelog"},"markAsSeen:listAction":function(n){return"Mark as seen"},"markAsSeen:noComment":function(n){return"Changes without comments"},"markAsSeen:finished":function(n){return"Finished"},"markAsSeen:dayOld":function(n){return"Older than a day"},"markAsSeen:weekOld":function(n){return"Older than a week"},"markAsSeen:all":function(n){return"All"},"PANEL:TITLE:changes":function(n){return"History"},"LIST:COLUMN:name":function(n){return"Product/component name"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:createdAt":function(n){return"Created at"},"PROPERTY:owner":function(n){return"Owner"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:level":function(n){return"Level"},"PROPERTY:order":function(n){return"Order/12NC"},"PROPERTY:orderNo":function(n){return"Order no"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:productName":function(n){return"Product name"},"PROPERTY:category":function(n){return"Category"},"PROPERTY:subCategory":function(n){return"Subcategory"},"PROPERTY:problem":function(n){return"Problem"},"PROPERTY:divisions":function(n){return"Division"},"PROPERTY:lines":function(n){return"Line"},"PROPERTY:qty":function(n){return"Quantity"},"PROPERTY:qtyTodo":function(n){return"Quantity todo"},"PROPERTY:qtyDone":function(n){return"Quantity done"},"PROPERTY:attachments":function(n){return"Attachments"},"PROPERTY:observers":function(n){return"Participants"},"PROPERTY:assessment":function(n){return"Assessment"},"PROPERTY:analysisNeed":function(n){return"Analysis needed"},"PROPERTY:analysisDone":function(n){return"Analysis done"},"PROPERTY:mainAnalyzer":function(n){return"Person responsible"},"PROPERTY:analyzers":function(n){return"People involved in the analysis"},"PROPERTY:why5":function(n){return"Problem cause"},"PROPERTY:why":function(n){return"Why?"},"PROPERTY:solution":function(n){return"Solution"},"PROPERTY:solutionSteps":function(n){return"Solution steps"},"PROPERTY:limit":function(n){return"Limit"},"PROPERTY:search":function(n){return"Text"},"PROPERTY:subdivisionType":function(n){return"Subdivision"},"PROPERTY:componentCode":function(n){return"Component"},"PROPERTY:componentName":function(n){return"Component name"},"PROPERTY:startedAt":function(n){return"Started at"},"PROPERTY:finishedAt":function(n){return"Finished at"},"PROPERTY:analysisStartedAt":function(n){return"Analysis started at"},"PROPERTY:analysisFinishedAt":function(n){return"Analysis finished at"},"PROPERTY:orderStatus":function(n){return"Current order status"},"levelIndicator:label":function(n){return"Entry escalation level"},"levelIndicator:title":function(n){return"Escalte entry to level "+t.v(n,"level")},"subdivisionType:unspecified":function(n){return"Unspecified"},"subdivisionType:assembly":function(n){return"Assembly"},"subdivisionType:press":function(n){return"Press"},"subdivisionType:wh":function(n){return"Warehouse"},"status:pending":function(n){return"Pending"},"status:started":function(n){return"Started"},"status:finished":function(n){return"Finished"},"assessment:header":function(n){return"Structural solution to the problem"},"assessment:unspecified":function(n){return"Unspecified"},"assessment:effective":function(n){return"Effective"},"assessment:ineffective":function(n){return"Ineffective"},"assessment:repeatable":function(n){return"Repeatable"},"message:pending":function(n){return"Entry awaits verification."},"message:started:true":function(n){return"Problem is being analyzed."},"message:started:false":function(n){return"Problem is being solved."},"message:finished:true":function(n){return"Entry is finished, but the analysis is still in progress."},"message:finished:false":function(n){return"Entry is finished."},"filter:user:mine":function(n){return"My entries"},"filter:user:mine:title":function(n){return"You are one of the participants"},"filter:user:unseen":function(n){return"Unread entries"},"filter:user:unseen:title":function(n){return"You are one of the participants in entries changed since your last visit"},"filter:user:others":function(n){return"Participant"},"filter:user:others:title":function(n){return"The specified user is one of the participants"},"filter:user:active":function(n){return"Active participant"},"filter:user:active:title":function(n){return"The specified user made a change in the entry"},"filter:user:creator":function(n){return"Creator"},"filter:user:creator:title":function(n){return"The specified user created the entry"},"filter:status:specific":function(n){return"Status"},"filter:status:analysis":function(n){return"Analysis"},"filter:submit":function(n){return"Filter"},"history:added":function(n){return"<i>Entry created at "+t.v(n,"time")+" on "+t.v(n,"ddd")+", "+t.v(n,"date")+".</i>"},"settings:tab:general":function(n){return"General"},"settings:general:pendingFunctions":function(n){return"Functions requiring verification"},"settings:general:pendingFunctions:help":function(n){return"Entries added by a user without assigned Function or with a Function from the following list will be added with the <em>Pending</em> status and will have to be verified by a leader."},"settings:general:categoryFunctions":function(n){return"Functions allowing category changes"},"settings:general:quickUsers":function(n){return"Users available in the quick add menu"},"navbar:dictionaries":function(n){return"Dictionaries"},"navbar:categories":function(n){return"Categories"},"navbar:subCategories":function(n){return"Subcategories"},"navbar:button":function(n){return"FAP"},"navbar:unseen":function(n){return"Unread"},"navbar:add":function(n){return"Add a new FAP"},"navbar:all":function(n){return"All"},"navbar:open":function(n){return"Open"},"navbar:pending":function(n){return"Pending"},"navbar:started":function(n){return"Started"},"navbar:finished":function(n){return"Finished"},"navbar:analysis":function(n){return"Analyzed"},"navbar:mine":function(n){return"Mine"},"navbar:reports:count":function(n){return"Report"},"addForm:subdivisions":function(n){return"Notified subdivisions"},"addForm:submit":function(n){return"Add entry"},"addForm:cancel":function(n){return"Cancel"},"addForm:orderNo:notFound":function(n){return"Order not found."},"addForm:componentCode:notFound":function(n){return"Component not found."},"addForm:notifications:subdivisions":function(n){return"Subdivisions"},"addForm:notifications:prodFunctions":function(n){return"Functions"},"addForm:copy:title":function(n){return"Copy category and problem from your last entry."},"addForm:copy:failure":function(n){return"Failed to copy the last entry."},"addForm:copy:notFound":function(n){return"You don't have any entries yet."},"upload:drop":function(n){return"Drop here any files you want to attach to the entry."},"upload:tooMany":function(n){return"You can attach at most "+t.v(n,"max")+" "+t.p(n,"max",0,"en",{one:"file",other:"files"})+"."},"upload:auth":function(n){return"Log in to add files."},"upload:failure":function(n){return"Failed to upload file: "+t.v(n,"file")},"chat:title":function(n){return"Chat"},"chat:submit":function(n){return"Send message"},"chat:send":function(n){return"Send message"},"chat:send:auth":function(n){return"Log in to send a message"},"chat:new":function(n){return"Click here to see new messages..."},"chat:status:pending:started":function(n){return"<i>Entry accepted.</i>"},"chat:status:started:finished":function(n){return"<i>Entry finished in "+t.v(n,"duration")+".</i>"},"chat:status:finished:started":function(n){return"<i>Entry restarted.</i>"},"chat:status:pending:finished":function(n){return"<i>Entry finished.</i>"},"chat:level:up":function(n){return"<i>Escalated the entry to level "+t.v(n,"level")+".</i>"},"chat:level:down":function(n){return"<i>De-escalated the entry to level "+t.v(n,"level")+".</i>"},"autolink:attachment":function(n){return"Attachment"},"autolink:product":function(n){return"12NC"},"autolink:document":function(n){return"15NC"},"autolink:order":function(n){return"Order no"},"autolink:entry":function(n){return"Entry"},"observers:message":function(n){return"Additional users will be automatically added after entry escalation."},"observers:placeholder":function(n){return"Add by last name or personnel ID..."},"observers:placeholder:auth":function(n){return"Log in to add a new participant..."},"attachments:upload":function(n){return"Add attachments"},"attachments:menu:rename":function(n){return"Change name"},"attachments:menu:remove":function(n){return"Remove file"},"orderNo:404":function(n){return"Order not found."},"orderNo:failure":function(n){return"Order validation failed."},"componentCode:404":function(n){return"Component not found."},"componentCode:failure":function(n){return"Component validation failed."},"notifications:added:title":function(n){return"New FAP entry: "+t.v(n,"rid")+" ("+t.v(n,"category")+")"},"notifications:changed:title":function(n){return"Changed FAP: "+t.v(n,"rid")},"notifications:changed:placeholder":function(n){return"Reply..."},"notifications:changed:reply":function(n){return"Send reply"},"report:title:count":function(n){return"Entry count"},"report:title:duration":function(n){return"Average entry duration [h]"},"report:title:owner":function(n){return"Entry count by owners"},"report:title:solver":function(n){return"Entry count by solvers"},"report:title:status":function(n){return"Entry count by statuses"},"report:title:level":function(n){return"Entry count by levels"},"report:title:category":function(n){return"Entry count by categories"},"report:title:subCategory":function(n){return"Entry count by subcategories"},"report:title:subdivisionType":function(n){return"Entry count by subdivisions"},"report:title:division":function(n){return"Entry count by divisions"},"report:title:mrp":function(n){return"Entry count by MRP"},"report:title:assessment":function(n){return"Entry count by assessment"},"report:title:shift":function(n){return"Entry count by production shift"},"report:title:hour":function(n){return"Entry count by creation hour"},"report:series:entry":function(n){return"Entry"},"report:series:analysis":function(n){return"Analysis"},"report:series:total":function(n){return"Total"},"report:filenames:count":function(n){return"FAP_Count"},"report:filenames:duration":function(n){return"FAP_Duration"},"report:filenames:owner":function(n){return"FAP_CountByOwners"},"report:filenames:solver":function(n){return"FAP_CountBySolvers"},"report:filenames:status":function(n){return"FAP_CountByStatuses"},"report:filenames:level":function(n){return"FAP_CountByLevels"},"report:filenames:category":function(n){return"FAP_CountByCategories"},"report:filenames:subCategory":function(n){return"FAP_CountBySubCategories"},"report:filenames:subdivisionType":function(n){return"FAP_CountBySubdivisions"},"report:filenames:division":function(n){return"FAP_CountByDivisions"},"report:filenames:mrp":function(n){return"FAP_CountByMRP"},"report:filenames:assessment":function(n){return"FAP_CountByAssessment"},"report:filenames:shift":function(n){return"FAP_CountByShift"},"report:filenames:hour":function(n){return"FAP_CountByHour"}},pl:!0}});