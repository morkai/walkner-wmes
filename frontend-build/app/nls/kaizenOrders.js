define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,u,o){return t.c(e,n),e[n]in o?o[e[n]]:(n=t.lc[u](e[n]-r),n in o?o[n]:o.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"Near miss"},"BREADCRUMBS:browse":function(e){return"Entries"},"BREADCRUMBS:addForm":function(e){return"Add"},"BREADCRUMBS:editForm":function(e){return"Edit"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Delete"},"BREADCRUMBS:reports:count":function(e){return"Number of entries"},"BREADCRUMBS:reports:summary":function(e){return"Summary"},"MSG:LOADING_FAILURE":function(e){return"Failed to load entries :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the entry :("},"MSG:DELETED":function(e){return"Entry <em>"+t.v(e,"label")+"</em> was deleted."},"MSG:jump:404":function(e){return"Entry <em>"+t.v(e,"rid")+"</em> doesn't exist :("},"MSG:markAsSeen:failure":function(e){return"Failed to mark the entry as read :("},"MSG:observe:failure":function(e){return"Failed to subscribe to the entry :("},"MSG:unobserve:failure":function(e){return"Failed to unsubscribe from the entry :("},"MSG:comment:failure":function(e){return"Failed to comment the entry :("},"PAGE_ACTION:export":function(e){return"Export entries"},"PAGE_ACTION:add":function(e){return"Add entry"},"PAGE_ACTION:edit":function(e){return"Edit entry"},"PAGE_ACTION:delete":function(e){return"Delete entry"},"PAGE_ACTION:markAsSeen":function(e){return"Mark as read"},"PAGE_ACTION:observe":function(e){return"Subscribe"},"PAGE_ACTION:unobserve":function(e){return"Unsubscribe"},"PAGE_ACTION:jump:title":function(e){return"Jump to entry by ID"},"PAGE_ACTION:jump:placeholder":function(e){return"Entry ID"},"PANEL:TITLE:details":function(e){return"Entry details"},"PANEL:TITLE:changes":function(e){return"Entry changes history"},"PANEL:TITLE:addForm":function(e){return"Add entry form"},"PANEL:TITLE:editForm":function(e){return"Edit entry form"},"LIST:owners":function(e){return t.v(e,"first")+" +"+t.p(e,"count",0,"en",{one:"1 other",other:t.v(e,"count")+" others"})},"PROPERTY:rid":function(e){return"ID"},"PROPERTY:types":function(e){return"Type"},"PROPERTY:subject":function(e){return"Subject"},"PROPERTY:subjectAndDescription":function(e){return"Subject/description"},"PROPERTY:eventDate":function(e){return"Event time"},"PROPERTY:eventDate:short":function(e){return"YY-MM-DD[, at ] H."},"PROPERTY:eventDate:long":function(e){return"LL[, at. ] H."},"PROPERTY:area":function(e){return"Area"},"PROPERTY:cause":function(e){return"Cause category"},"PROPERTY:causeText":function(e){return"Casue"},"PROPERTY:risk":function(e){return"Risk"},"PROPERTY:category":function(e){return"Category"},"PROPERTY:section":function(e){return"Section"},"PROPERTY:nearMissCategory":function(e){return"Near miss category"},"PROPERTY:suggestionCategory":function(e){return"Suggestion category"},"PROPERTY:description":function(e){return"Description (how it is)"},"PROPERTY:nearMissOwners":function(e){return"Owners"},"PROPERTY:nearMissOwner":function(e){return"Owner"},"PROPERTY:suggestionOwners":function(e){return"Owners"},"PROPERTY:kaizenOwners":function(e){return"Owners"},"PROPERTY:correctiveMeasures":function(e){return"Corrective measures"},"PROPERTY:preventiveMeasures":function(e){return"Preventive measures"},"PROPERTY:suggestion":function(e){return"Suggestion (how it should be)"},"PROPERTY:kaizenStartDate":function(e){return"Start date"},"PROPERTY:kaizenFinishDate":function(e){return"Finish date"},"PROPERTY:kaizenDuration":function(e){return"Duration"},"PROPERTY:kaizenImprovements":function(e){return"Improvements"},"PROPERTY:kaizenEffect":function(e){return"Effect"},"PROPERTY:status":function(e){return"Status"},"PROPERTY:creator":function(e){return"Created by"},"PROPERTY:updater":function(e){return"Updated by"},"PROPERTY:confirmer":function(e){return"Confirmed by"},"PROPERTY:createdAt":function(e){return"Created at"},"PROPERTY:updatedAt":function(e){return"Updated at"},"PROPERTY:confirmedAt":function(e){return"Confirmed at"},"PROPERTY:attachments":function(e){return"Attachments"},"PROPERTY:attachments:description":function(e){return"Description"},"PROPERTY:attachments:file":function(e){return"File name"},"PROPERTY:attachments:type":function(e){return"File type"},"PROPERTY:comment":function(e){return"Comment/opinion"},"PROPERTY:subscribers":function(e){return"Subscribers"},"PROPERTY:observers:name":function(e){return"Name"},"PROPERTY:observers:role":function(e){return"Role"},"PROPERTY:observers:lastSeenAt":function(e){return"Last seen at"},"type:nearMiss":function(e){return"Near Miss"},"type:suggestion":function(e){return"Suggestion"},"type:kaizen":function(e){return"Kaizen"},"type:short:nearMiss":function(e){return"NM"},"type:short:suggestion":function(e){return"Suggestion"},"type:short:kaizen":function(e){return"Kaizen"},"type:label:nearMiss":function(e){return"NM"},"type:label:suggestion":function(e){return"SUG"},"type:label:kaizen":function(e){return"KZN"},"status:new":function(e){return"New"},"status:accepted":function(e){return"Accepted"},"status:todo":function(e){return"To do"},"status:inProgress":function(e){return"In progress"},"status:cancelled":function(e){return"Cancelled"},"status:finished":function(e){return"Finished"},"status:paused":function(e){return"Paused"},"status:open":function(e){return"Open"},"role:creator":function(e){return"Creator"},"role:confirmer":function(e){return"Confirmer"},"role:owner":function(e){return"Owner"},"role:subscriber":function(e){return"Subscriber"},"tab:attachments":function(e){return"Attachments"},"tab:observers":function(e){return"Participants"},"attachments:noData":function(e){return"Entry doesn't have any attachments."},"attachments:actions:view":function(e){return"Open the file"},"attachments:actions:download":function(e){return"Download the file"},"attachments:scan":function(e){return"Document scan"},"attachments:scan:current":function(e){return"Current document scan"},"attachments:scan:new":function(e){return"New document scan"},"attachments:before":function(e){return"State before"},"attachments:before:current":function(e){return"Current state before"},"attachments:before:new":function(e){return"New state before"},"attachments:after":function(e){return"State after"},"attachments:after:current":function(e){return"Current state after"},"attachments:after:new":function(e){return"New state after"},"FORM:ACTION:add":function(e){return"Add entry"},"FORM:ACTION:edit":function(e){return"Save"},"FORM:ERROR:addFailure":function(e){return"Failed to add the entry :("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the entry :("},"FORM:ERROR:onlyKaizen":function(e){return"Kaizen requires a Near Miss or a Suggestion!"},"FORM:ERROR:upload":function(e){return"Failed to upload the attachments :("},"FORM:ERROR:date":function(e){return"The specified date cannot differ from the current date by more than "+t.v(e,"days")+" days."},"FORM:MSG:eventTime":function(e){return"Hour"},"FORM:MSG:optional":function(e){return"The fields below are optional. Leave them empty, if you don't know what to enter."},"FORM:MSG:chooseTypes":function(e){return"Choose the entry types (NM, Suggestion, Kaizen) by clicking on the on the bars below. Entry can have any combination of types at the same time."},"FORM:MSG:attachmentEdit":function(e){return"Choose new files only if you want to override the current files."},"FORM:help:subject":function(e){return"Entry a short text..."},"FORM:help:section":function(e){return"Choose your section..."},"FORM:help:confirmer":function(e){return"Choose a superior of the chosen section..."},"FORM:help:correctiveMeasures":function(e){return"What was done to remove consequences of this particular event."},"FORM:help:preventiveMeasures":function(e){return"What was done to stop similar events occurring again in the future."},"FORM:help:subscribers":function(e){return"You can select additional people, that weren't selected in the previous fields, but may be interesed in this entry or you want for them to express their opinion.<br>Those people will be added to a list of participants with an Observer role, and will be notified about changes in this entry."},"FORM:help:date:diff":function(e){return"The chosen date is "+t.v(e,"days")+" days in the "+t.v(e,"dir")+"."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Entry deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete entry"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen entry?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+t.v(e,"label")+"</em> entry?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the entry :("},"filter:cause":function(e){return"Cause"},"filter:user:mine":function(e){return"Mine"},"filter:user:unseen":function(e){return"Unread"},"filter:user:owner":function(e){return"Owner"},"filter:user:others":function(e){return"Participant"},"filter:submit":function(e){return"Filter"},"history:added":function(e){return"added the entry."},"history:observer:0":function(e){return"subscribed to the entry."},"history:observer:1":function(e){return"unsubscribe from the entry."},"history:editMessage":function(e){return"Here you can add a new comment. If you also want to change some properties, <a href='"+t.v(e,"editUrl")+"'>then use the edit form</a>."},"history:submit":function(e){return"Comment"},"report:title:type":function(e){return"Entry count"},"report:title:status":function(e){return"Entry count by statuses"},"report:title:section":function(e){return"Entry count by sections"},"report:title:area":function(e){return"Entry count by areas"},"report:title:cause":function(e){return"Entry count by causes"},"report:title:risk":function(e){return"Entry count by risks"},"report:title:nearMissCategory":function(e){return"Entry count by NM categories"},"report:title:suggestionCategory":function(e){return"Entry count by Suggestion categories"},"report:title:confirmer":function(e){return"Entry count by confirmers"},"report:title:owner":function(e){return"Entry count by owners"},"report:series:singleTotal":function(e){return"Total (w/o type repeats)"},"report:series:multiTotal":function(e){return"Total (w/ type repeats)"},"report:series:entry":function(e){return"Entries"},"report:series:nearMiss":function(e){return"Near misses"},"report:series:suggestion":function(e){return"Suggestions"},"report:series:kaizen":function(e){return"Kaizens"},"report:series:new":function(e){return"New"},"report:series:accepted":function(e){return"Accepted"},"report:series:todo":function(e){return"To do"},"report:series:inProgress":function(e){return"In progress"},"report:series:cancelled":function(e){return"Cancelled"},"report:series:finished":function(e){return"Finished"},"report:series:paused":function(e){return"Paused"},"report:filenames:type":function(e){return"NR_CountByType"},"report:filenames:status":function(e){return"NR_CountByStatus"},"report:filenames:section":function(e){return"NR_CountBySection"},"report:filenames:area":function(e){return"NR_CountByArea"},"report:filenames:cause":function(e){return"NR_CountByCause"},"report:filenames:risk":function(e){return"NR_CountByRisk"},"report:filenames:nearMissCategory":function(e){return"NR_CountByNMCategory"},"report:filenames:suggestionCategory":function(e){return"NR_CountBySUGCategory"},"report:filenames:confirmer":function(e){return"NR_CountByConfirmer"},"report:filenames:owner":function(e){return"NR_CountByOwner"},"report:title:summary:averageDuration":function(e){return"Average number of implementation days by week"},"report:title:summary:count":function(e){return"Number of entries by week"},"report:title:summary:suggestionOwners":function(e){return"Number of near misses by owner"},"report:subtitle:summary:averageDuration":function(e){return"Total average: "+t.v(e,"averageDuration")},"report:subtitle:summary:count":function(e){return"Total count: "+t.v(e,"total")+" ("+t.v(e,"open")+" open, "+t.v(e,"finished")+" finished, "+t.v(e,"cancelled")+" cancelled)"},"report:series:summary:averageDuration":function(e){return"Avg. no. of impl. days"},"report:series:summary:open":function(e){return"Open"},"report:series:summary:finished":function(e){return"Finished"},"report:series:summary:cancelled":function(e){return"Cancelled"},"report:filenames:summary:averageDuration":function(e){return"NR_AvgImplDays"},"report:filenames:summary:count":function(e){return"NR_CountByWeek"},"report:filenames:summary:nearMissOwners":function(e){return"NR_CountByOwners"},"thanks:message":function(e){return"Thanks for the entry!"},"thanks:footnote":function(e){return"(click any button or key to close this window)"},"BREADCRUMBS:reports:metrics":function(e){return"Metrics"},"report:title:ipr":function(e){return"IPR by section"},"report:title:ips":function(e){return"IP Structure by section"},"report:title:ipc":function(e){return"IP Coverage by section"},"report:subtitle:ipr":function(e){return"Total IPR: "+t.v(e,"value")},"report:subtitle:ips":function(e){return"Total IP Structure: "+t.v(e,"value")+"%"},"report:subtitle:ipc":function(e){return"Total IP Coverage: "+t.v(e,"value")+"%"},"report:series:ipr":function(e){return"IPR"},"report:series:ips":function(e){return"IPS"},"report:series:ipc":function(e){return"IPC"},"report:filenames:ipr":function(e){return"NR_IPR"},"report:filenames:ips":function(e){return"NR_IPS"},"report:filenames:ipc":function(e){return"NR_IPC"}},pl:!0}});