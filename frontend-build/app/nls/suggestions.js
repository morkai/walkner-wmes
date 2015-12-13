define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,u,o){return n.c(t,e),t[e]in o?o[t[e]]:(e=n.lc[u](t[e]-r),e in o?o[e]:o.other)},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{root:{"BREADCRUMBS:base":function(t){return"Suggestions"},"BREADCRUMBS:browse":function(t){return"Entries"},"BREADCRUMBS:addForm":function(t){return"Add"},"BREADCRUMBS:editForm":function(t){return"Edit"},"BREADCRUMBS:ACTION_FORM:delete":function(t){return"Delete"},"BREADCRUMBS:reports:count":function(t){return"Number of entries"},"BREADCRUMBS:reports:summary":function(t){return"Summary"},"navbar:base":function(t){return"Suggestions"},"navbar:orders":function(t){return"Entries"},"navbar:all":function(t){return"All"},"navbar:open":function(t){return"Only open"},"navbar:mine":function(t){return"Only mine"},"navbar:unseen":function(t){return"Only unread"},"navbar:reports":function(t){return"Reports"},"navbar:reports:count":function(t){return"Number of entries"},"navbar:reports:summary":function(t){return"Summary"},"navbar:dictionaries":function(t){return"Dictionaries"},"navbar:sections":function(t){return"Sections"},"navbar:categories":function(t){return"Categories"},"navbar:productFamilies":function(t){return"Product families"},"navbar:help":function(t){return"Help"},"MSG:LOADING_FAILURE":function(t){return"Failed to load entries :("},"MSG:LOADING_SINGLE_FAILURE":function(t){return"Failed to load the entry :("},"MSG:DELETED":function(t){return"Entry <em>"+n.v(t,"label")+"</em> was deleted."},"MSG:jump:404":function(t){return"Entry <em>"+n.v(t,"rid")+"</em> doesn't exist :("},"MSG:markAsSeen:failure":function(t){return"Failed to mark the entry as read :("},"MSG:observe:failure":function(t){return"Failed to subscribe to the entry :("},"MSG:unobserve:failure":function(t){return"Failed to unsubscribe from the entry :("},"MSG:comment:failure":function(t){return"Failed to comment the entry :("},"PAGE_ACTION:export":function(t){return"Export entries"},"PAGE_ACTION:add":function(t){return"Add entry"},"PAGE_ACTION:edit":function(t){return"Edit entry"},"PAGE_ACTION:delete":function(t){return"Delete entry"},"PAGE_ACTION:markAsSeen":function(t){return"Mark as read"},"PAGE_ACTION:observe":function(t){return"Subscribe"},"PAGE_ACTION:unobserve":function(t){return"Unsubscribe"},"PAGE_ACTION:jump:title":function(t){return"Jump to entry by ID"},"PAGE_ACTION:jump:placeholder":function(t){return"Entry ID"},"PANEL:TITLE:details":function(t){return"Entry details"},"PANEL:TITLE:changes":function(t){return"Entry changes history"},"PANEL:TITLE:addForm":function(t){return"Add entry form"},"PANEL:TITLE:editForm":function(t){return"Edit entry form"},"LIST:owners":function(t){return n.v(t,"first")+" +"+n.p(t,"count",0,"en",{one:"1 other",other:n.v(t,"count")+" others"})},"PROPERTY:rid":function(t){return"ID"},"PROPERTY:subject":function(t){return"Subject"},"PROPERTY:subjectAndDescription":function(t){return"Subject/description"},"PROPERTY:date":function(t){return"Entry date"},"PROPERTY:howItIs":function(t){return"How it is?"},"PROPERTY:howItShouldBe":function(t){return"How it should be?"},"PROPERTY:suggestion":function(t){return"Suggestion"},"PROPERTY:category":function(t){return"Category"},"PROPERTY:categories":function(t){return"Categories"},"PROPERTY:productFamily":function(t){return"Product family"},"PROPERTY:section":function(t){return"Section"},"PROPERTY:suggestionOwners":function(t){return"Owners"},"PROPERTY:kaizenOwners":function(t){return"Owners"},"PROPERTY:kaizenStartDate":function(t){return"Start date"},"PROPERTY:kaizenFinishDate":function(t){return"Finish date"},"PROPERTY:kaizenDuration":function(t){return"Kaizen duration"},"PROPERTY:kaizenImprovements":function(t){return"Improvements"},"PROPERTY:kaizenEffect":function(t){return"Effect"},"PROPERTY:status":function(t){return"Status"},"PROPERTY:creator":function(t){return"Created by"},"PROPERTY:updater":function(t){return"Updated by"},"PROPERTY:confirmer":function(t){return"Confirmed by"},"PROPERTY:createdAt":function(t){return"Created at"},"PROPERTY:updatedAt":function(t){return"Updated at"},"PROPERTY:confirmedAt":function(t){return"Confirmed at"},"PROPERTY:attachments":function(t){return"Attachments"},"PROPERTY:attachments:description":function(t){return"Description"},"PROPERTY:attachments:file":function(t){return"File name"},"PROPERTY:attachments:type":function(t){return"File type"},"PROPERTY:comment":function(t){return"Comment/opinion"},"PROPERTY:subscribers":function(t){return"Subscribers"},"PROPERTY:observers:name":function(t){return"Name"},"PROPERTY:observers:role":function(t){return"Role"},"PROPERTY:observers:lastSeenAt":function(t){return"Last seen at"},"PROPERTY:finishDuration":function(t){return"Entry duration"},"type:suggestion":function(t){return"Suggestion"},"type:kaizen":function(t){return"Kaizen"},"status:new":function(t){return"New"},"status:accepted":function(t){return"Accepted"},"status:todo":function(t){return"To do"},"status:inProgress":function(t){return"In progress"},"status:cancelled":function(t){return"Cancelled"},"status:finished":function(t){return"Finished"},"status:paused":function(t){return"Paused"},"status:open":function(t){return"Open"},"role:creator":function(t){return"Creator"},"role:confirmer":function(t){return"Confirmer"},"role:owner":function(t){return"Owner"},"role:subscriber":function(t){return"Subscriber"},"tab:attachments":function(t){return"Attachments"},"tab:observers":function(t){return"Participants"},"attachments:noData":function(t){return"Entry doesn't have any attachments."},"attachments:actions:view":function(t){return"Open the file"},"attachments:actions:download":function(t){return"Download the file"},"attachments:scan":function(t){return"Document scan"},"attachments:scan:current":function(t){return"Current document scan"},"attachments:scan:new":function(t){return"New document scan"},"attachments:before":function(t){return"State before"},"attachments:before:current":function(t){return"Current state before"},"attachments:before:new":function(t){return"New state before"},"attachments:after":function(t){return"State after"},"attachments:after:current":function(t){return"Current state after"},"attachments:after:new":function(t){return"New state after"},"FORM:ACTION:add":function(t){return"Add entry"},"FORM:ACTION:edit":function(t){return"Save"},"FORM:ERROR:addFailure":function(t){return"Failed to add the entry :("},"FORM:ERROR:editFailure":function(t){return"Failed to edit the entry :("},"FORM:ERROR:upload":function(t){return"Failed to upload the attachments :("},"FORM:MSG:attachmentEdit":function(t){return"Choose new files only if you want to override the current files."},"FORM:help:subject":function(t){return"Enter a short text..."},"FORM:help:section":function(t){return"Choose your section..."},"FORM:help:confirmer":function(t){return"Search a superior, to whom this entry should be directed for a confirmation..."},"FORM:help:subscribers":function(t){return"You can select additional people, that weren't selected in the previous fields, but may be interested in this entry or you want for them to express their opinion.<br>Those people will be added to a list of participants with an Observer role, and will be notified about changes in this entry."},"FORM:help:date:diff":function(t){return"Wybrano datę będącą "+n.v(t,"days")+" dni w "+n.s(t,"dir",{past:"przeszłości",other:"przyszłości"})+"."},"ACTION_FORM:DIALOG_TITLE:delete":function(t){return"Entry deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(t){return"Delete entry"},"ACTION_FORM:MESSAGE:delete":function(t){return"Are you sure you want to delete the chosen entry?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Are you sure you want to delete the <em>"+n.v(t,"label")+"</em> entry?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(t){return"Failed to delete the entry :("},"filter:user:mine":function(t){return"Mine"},"filter:user:unseen":function(t){return"Unread"},"filter:user:owner":function(t){return"Owner"},"filter:user:others":function(t){return"Participant"},"filter:submit":function(t){return"Filter"},"history:added":function(t){return"added the entry."},"history:observer:0":function(t){return"subscribed to the entry."},"history:observer:1":function(t){return"unsubscribe from the entry."},"history:editMessage":function(t){return"Here you can add a new comment. If you also want to change some properties, <a href='"+n.v(t,"editUrl")+"'>then use the edit form</a>."},"history:submit":function(t){return"Comment"},"report:title:total":function(t){return"Entry count"},"report:title:status":function(t){return"Entry count by status"},"report:title:section":function(t){return"Entry count by section"},"report:title:productFamily":function(t){return"Entry count by product family"},"report:title:category":function(t){return"Entry count by category"},"report:title:confirmer":function(t){return"Entry count by confirmers"},"report:title:owner":function(t){return"Entry count by owners"},"report:series:total":function(t){return"Total"},"report:series:entry":function(t){return"Entries"},"report:series:suggestion":function(t){return"Suggestions"},"report:series:kaizen":function(t){return"Kaizens"},"report:series:new":function(t){return"New"},"report:series:accepted":function(t){return"Accepted"},"report:series:todo":function(t){return"To do"},"report:series:inProgress":function(t){return"In progress"},"report:series:cancelled":function(t){return"Cancelled"},"report:series:finished":function(t){return"Finished"},"report:series:paused":function(t){return"Paused"},"report:filenames:type":function(t){return"SUG_Count"},"report:filenames:status":function(t){return"SUG_CountByStatus"},"report:filenames:section":function(t){return"SUG_CountBySection"},"report:filenames:productFamily":function(t){return"SUG_CountByProductFamily"},"report:filenames:category":function(t){return"SUG_CountByCategory"},"report:filenames:confirmer":function(t){return"SUG_CountByConfirmer"},"report:filenames:owner":function(t){return"SUG_CountByOwner"},"report:title:summary:averageDuration":function(t){return"Average number of implementation days by week"},"report:title:summary:count":function(t){return"Number of entries by week"},"report:title:summary:suggestionOwners":function(t){return"Number of suggestions by owner"},"report:subtitle:summary:averageDuration":function(t){return"Total average: "+n.v(t,"averageDuration")},"report:subtitle:summary:count":function(t){return"Total count: "+n.v(t,"total")+" ("+n.v(t,"open")+" open, "+n.v(t,"finished")+" finished, "+n.v(t,"cancelled")+" cancelled)"},"report:series:summary:averageDuration":function(t){return"Avg. no. of impl. days"},"report:series:summary:open":function(t){return"Open"},"report:series:summary:finished":function(t){return"Finished"},"report:series:summary:cancelled":function(t){return"Cancelled"},"report:filenames:summary:averageDuration":function(t){return"SUG_AvgImplDays"},"report:filenames:summary:count":function(t){return"SUG_CountByWeek"},"report:filenames:summary:suggestionOwners":function(t){return"SUG_CountByOwners"},"thanks:message":function(t){return"Thanks for the entry!"},"thanks:footnote":function(t){return"(click any button or key to close this window)"}},pl:!0}});