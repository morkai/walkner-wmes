define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,o,i){return n.c(t,e),t[e]in i?i[t[e]]:(e=n.lc[o](t[e]-r))in i?i[e]:i.other},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{root:{"BREADCRUMB:base":function(t){return"Suggestions"},"BREADCRUMB:browse":function(t){return"Entries"},"BREADCRUMB:reports:count":function(t){return"Number of entries"},"BREADCRUMB:reports:summary":function(t){return"Summary"},"BREADCRUMB:reports:engagement":function(t){return"Engagement"},"BREADCRUMB:reports:reward":function(t){return"Reward"},"MSG:markAsSeen:failure":function(t){return"Failed to mark the entry as read."},"MSG:observe:failure":function(t){return"Failed to subscribe to the entry."},"MSG:unobserve:failure":function(t){return"Failed to unsubscribe from the entry."},"MSG:comment:failure":function(t){return"Failed to comment the entry."},"PAGE_ACTION:add":function(t){return"Add entry"},"PAGE_ACTION:markAsSeen":function(t){return"Mark as read"},"PAGE_ACTION:observe":function(t){return"Subscribe"},"PAGE_ACTION:unobserve":function(t){return"Unsubscribe"},"PAGE_ACTION:print":function(t){return"Printable version"},"PAGE_ACTION:kom":function(t){return"KotM"},"PAGE_ACTION:coordinate":function(t){return"Confirm"},"PAGE_ACTION:accept":function(t){return"Accept"},"PAGE_ACTION:complete":function(t){return"Complete"},"PAGE_ACTION:verify":function(t){return"Verify"},"PAGE_ACTION:settings":function(t){return"Settings"},"PANEL:TITLE:coordSections":function(t){return"Coordinating departments"},"PANEL:TITLE:attachments":function(t){return"Attachments"},"PANEL:TITLE:observers":function(t){return"Participants"},"PANEL:TITLE:changes":function(t){return"Change history"},"LIST:owners":function(t){return n.v(t,"first")+" +"+n.p(t,"count",0,"en",{one:"1 other",other:n.v(t,"count")+" others"})},"PROPERTY:rid":function(t){return"ID"},"PROPERTY:subject":function(t){return"Subject"},"PROPERTY:subjectAndDescription":function(t){return"Subject/description"},"PROPERTY:date":function(t){return"Entry date"},"PROPERTY:howItIs":function(t){return"How it is?"},"PROPERTY:howItShouldBe":function(t){return"How it should be?"},"PROPERTY:suggestion":function(t){return"Suggestion"},"PROPERTY:category":function(t){return"Category"},"PROPERTY:categories":function(t){return"Categories"},"PROPERTY:productFamily":function(t){return"Product family"},"PROPERTY:kaizenEvent":function(t){return"Product family (KE)"},"PROPERTY:section":function(t){return"Department"},"PROPERTY:owners":function(t){return"Owners"},"PROPERTY:suggestionOwners":function(t){return"Owners"},"PROPERTY:kaizenOwners":function(t){return"Owners"},"PROPERTY:kaizenStartDate":function(t){return"Start date"},"PROPERTY:kaizenFinishDate":function(t){return"Finish date"},"PROPERTY:kaizenDuration":function(t){return"Kaizen duration"},"PROPERTY:kaizenImprovements":function(t){return"Improvements"},"PROPERTY:kaizenEffect":function(t){return"Effect"},"PROPERTY:status":function(t){return"Status"},"PROPERTY:kom":function(t){return"Kaizen of the Month"},"PROPERTY:creator":function(t){return"Creator"},"PROPERTY:updater":function(t){return"Updater"},"PROPERTY:confirmer":function(t){return"Kaizen coordinator"},"PROPERTY:superior":function(t){return"Superior"},"PROPERTY:createdAt":function(t){return"Created at"},"PROPERTY:updatedAt":function(t){return"Updated at"},"PROPERTY:confirmedAt":function(t){return"Confirmed at"},"PROPERTY:finishedAt":function(t){return"Finished at"},"PROPERTY:attachments":function(t){return"Attachments"},"PROPERTY:attachments:description":function(t){return"Description"},"PROPERTY:attachments:file":function(t){return"File name"},"PROPERTY:attachments:type":function(t){return"File type"},"PROPERTY:comment":function(t){return"Comment/opinion"},"PROPERTY:subscribers":function(t){return"Subscribers"},"PROPERTY:observers:name":function(t){return"Name"},"PROPERTY:observers:role":function(t){return"Role"},"PROPERTY:observers:lastSeenAt":function(t){return"Last seen at"},"PROPERTY:finishDuration":function(t){return"Entry duration"},"PROPERTY:coordSections":function(t){return"Coordinating departments"},"PROPERTY:coordSections:name":function(t){return"Department"},"PROPERTY:coordSections:status":function(t){return"Status"},"PROPERTY:coordSections:user":function(t){return"Coordinator"},"PROPERTY:coordSections:time":function(t){return"Decision time"},"PROPERTY:coordSections:comment":function(t){return"Comment"},"PROPERTY:coordSections:users":function(t){return"Users"},"coordSections:add:placeholder":function(t){return"Select coordinating departments..."},"coordSections:edit:placeholder":function(t){return"Add coordinating department"},"coordSections:status:pending":function(t){return"Pending"},"coordSections:status:rejected":function(t){return"Rejected"},"coordSections:status:accepted":function(t){return"Accepted"},"coordSections:noData":function(t){return"Entry doesn't have any coordinating departments."},"type:suggestion":function(t){return"Suggestion"},"type:kaizen":function(t){return"Kaizen"},"status:new":function(t){return"New"},"status:accepted":function(t){return"Acceptance"},"status:inProgress":function(t){return"In progress"},"status:verification":function(t){return"Verification"},"status:cancelled":function(t){return"Cancelled"},"status:finished":function(t){return"Finished"},"status:open":function(t){return"Open"},"status:kom":function(t){return"Kaizen of the Month"},"role:creator":function(t){return"Creator"},"role:confirmer":function(t){return"Kaizen coordinator"},"role:superior":function(t){return"Superior"},"role:owner":function(t){return"Owner"},"role:subscriber":function(t){return"Subscriber"},"role:coordinator":function(t){return"Coordinator"},"attachments:noData":function(t){return"Entry doesn't have any attachments."},"attachments:actions:view":function(t){return"Open the file"},"attachments:actions:download":function(t){return"Download the file"},"attachments:scan":function(t){return"Document scan"},"attachments:scan:current":function(t){return"Current document scan"},"attachments:scan:new":function(t){return"New document scan"},"attachments:before":function(t){return"State before"},"attachments:before:current":function(t){return"Current state before"},"attachments:before:new":function(t){return"New state before"},"attachments:after":function(t){return"State after"},"attachments:after:current":function(t){return"Current state after"},"attachments:after:new":function(t){return"New state after"},"FORM:ACTION:edit":function(t){return"Save"},"FORM:backTo:behaviorObsCards:cancel":function(t){return"Cancel and go back to the observations card"},"FORM:backTo:behaviorObsCards:add":function(t){return"Add entry and go back to the observations card"},"FORM:backTo:behaviorObsCards:edit":function(t){return"Save and go back to the observations card"},"FORM:backTo:minutesForSafetyCards:cancel":function(t){return"Cancel and go back to the minutes card"},"FORM:backTo:minutesForSafetyCards:add":function(t){return"Add entry and go back to the minutes card"},"FORM:backTo:minutesForSafetyCards:edit":function(t){return"Save and go back to the minutes card"},"FORM:backTo:kaizenOrders:cancel":function(t){return"Cancel and go back to the near miss"},"FORM:backTo:kaizenOrders:add":function(t){return"Add entry and go back to the near miss"},"FORM:backTo:kaizenOrders:edit":function(t){return"Save and go back to the near miss"},"FORM:ERROR:upload":function(t){return"Failed to upload the attachments."},"FORM:ERROR:date":function(t){return"The specified date cannot differ from the current date by more than "+n.v(t,"days")+" days."},"FORM:ERROR:ownerConfirmer":function(t){return"Owner cannot also be the Confirmer."},"FORM:ERROR:sectionCoord":function(t){return"Department cannot also be a coordinating department."},"FORM:ERROR:tooManyOwners":function(t){return"Only "+n.v(t,"max")+" "+n.p(t,"max",0,"en",{one:"Owner",other:"Owners"})+" can be specified."},"FORM:ERROR:tooManyTotalOwners":function(t){return"Only "+n.v(t,"max")+" "+n.p(t,"max",0,"en",{one:"Owner",other:"different Owners"})+" can be specified in total."},"FORM:MSG:attachmentEdit":function(t){return"Choose new files only if you want to override the current files."},"FORM:help:subject":function(t){return"Enter a short text..."},"FORM:help:section":function(t){return"Select your section..."},"FORM:help:subscribers":function(t){return"You can select additional people, that weren't selected in the previous fields, but may be interested in this entry or you want for them to express their opinion.<br>Those people will be added to a list of participants with an Observer role, and will be notified about changes in this entry."},"FORM:help:date:diff":function(t){return"The selected date is "+n.v(t,"days")+" days in the "+n.s(t,"dir",{past:"past",other:"future"})+"."},"FORM:productFamily:other":function(t){return"(other)"},"FORM:productFamily:list":function(t){return"(list)"},"FORM:productFamily:kaizenEvent":function(t){return"Other..."},"FORM:confirmer:other":function(t){return"(other)"},"FORM:confirmer:list":function(t){return"(list)"},"FORM:confirmer:section":function(t){return"Select your section..."},"FORM:confirmer:search":function(t){return"Search a superior, to whom this entry should be directed for a confirmation..."},"FORM:confirmer:select":function(t){return"Select a superior, to whom this entry should be directed for a confirmation..."},"filter:date":function(t){return"Entry date"},"filter:finishedAt":function(t){return"Finished at"},"filter:user:mine":function(t){return"My entries"},"filter:user:mine:title":function(t){return"You are one of the participants"},"filter:user:unseen":function(t){return"Unread entries"},"filter:user:unseen:title":function(t){return"You are one of the participants in entries changed since your last visit"},"filter:user:others":function(t){return"Participant"},"filter:user:others:title":function(t){return"The specified user is one of the participants"},"filter:user:confirmer":function(t){return"Kaizen coordinator"},"filter:user:confirmer:title":function(t){return"The specified user is a Kaizen coordinator"},"filter:user:superior":function(t){return"Superior"},"filter:user:superior:title":function(t){return"The specified user is a superior"},"filter:user:owners":function(t){return"Owner"},"filter:user:owners:title":function(t){return"The specified user is a suggestion or kaizen owner"},"filter:user:suggestionOwners":function(t){return"Suggestion owner"},"filter:user:suggestionOwners:title":function(t){return"The specified user is a suggestion owner"},"filter:user:kaizenOwners":function(t){return"Kaizen owner"},"filter:user:kaizenOwners:title":function(t){return"The specified user is a kaizen owner"},"filter:submit":function(t){return"Filter"},"history:added":function(t){return"added the entry."},"history:observer:0":function(t){return"subscribed to the entry."},"history:observer:1":function(t){return"unsubscribe from the entry."},"history:submit":function(t){return"Comment"},"report:title:total":function(t){return"Entry count"},"report:title:status":function(t){return"Entry count by status"},"report:title:section":function(t){return"Entry count by section"},"report:title:productFamily":function(t){return"Entry count by product family"},"report:title:category":function(t){return"Entry count by category"},"report:title:confirmer":function(t){return"Entry count by confirmers"},"report:title:superior":function(t){return"Entry count by superiors"},"report:title:owner":function(t){return"Entry count by owners"},"report:series:total":function(t){return"Total"},"report:series:entry":function(t){return"Entries"},"report:series:suggestion":function(t){return"Suggestions"},"report:series:kaizen":function(t){return"Kaizens"},"report:series:kaizenEvent":function(t){return"Kaizen Events"},"report:filenames:type":function(t){return"SUG_Count"},"report:filenames:status":function(t){return"SUG_CountByStatus"},"report:filenames:section":function(t){return"SUG_CountBySection"},"report:filenames:productFamily":function(t){return"SUG_CountByProductFamily"},"report:filenames:category":function(t){return"SUG_CountByCategory"},"report:filenames:confirmer":function(t){return"SUG_CountByConfirmer"},"report:filenames:superior":function(t){return"SUG_CountBySuperior"},"report:filenames:owner":function(t){return"SUG_CountByOwner"},"report:title:summary:averageDuration":function(t){return"Average number of implementation days by week"},"report:title:summary:count":function(t){return"Number of entries by week"},"report:title:summary:suggestionOwners":function(t){return"Number of suggestions by owner"},"report:title:summary:categories":function(t){return"Number of suggestions by category"},"report:subtitle:summary:averageDuration":function(t){return"Total average: "+n.v(t,"averageDuration")},"report:subtitle:summary:averageDuration:short":function(t){return"Total average: "+n.v(t,"averageDuration")},"report:subtitle:summary:productFamily":function(t){return"Product family: "+n.v(t,"productFamily")},"report:subtitle:summary:section":function(t){return"Section: "+n.v(t,"section")},"report:subtitle:summary:count":function(t){return"Total count: "+n.v(t,"total")+" ("+n.v(t,"open")+" open, "+n.v(t,"finished")+" finished, "+n.v(t,"cancelled")+" cancelled)"},"report:series:summary:averageDuration":function(t){return"Avg. no. of impl. days"},"report:series:summary:open":function(t){return"Open"},"report:series:summary:finished":function(t){return"Finished"},"report:series:summary:cancelled":function(t){return"Cancelled"},"report:filenames:summary:averageDuration":function(t){return"SUG_AvgImplDays"},"report:filenames:summary:count":function(t){return"SUG_CountByWeek"},"report:filenames:summary:suggestionOwners":function(t){return"SUG_CountByOwners"},"report:filenames:summary:categories":function(t){return"SUG_CountByCategory"},"thanks:message":function(t){return"Thanks for the entry!"},"thanks:footnote":function(t){return"(click any button or key to close this window)"},"engagement:name":function(t){return"Name"},"engagement:nearMisses":function(t){return"Near misses"},"engagement:suggestions":function(t){return"OSH+ergonomics"},"engagement:behaviorObs":function(t){return"Behavior observations"},"engagement:minutesForSafety":function(t){return"Minutes for safety"},"engagement:sections":function(t){return"Section"},"engagement:empty":function(t){return"No entries matching the current filters."},"engagement:export:action":function(t){return"Export to file"},"engagement:export:filename":function(t){return"WMES_ENGAGEMENT"},"reward:name":function(t){return"Name"},"reward:finished":function(t){return"Finished"},"reward:kom":function(t){return"KotM"},"reward:total":function(t){return"Total"},"reward:sections":function(t){return"Section"},"reward:count":function(t){return"Count"},"reward:part":function(t){return"Participation"},"reward:value":function(t){return"Gratification"},"reward:empty":function(t){return"No entries matching the current filters."},"reward:filter:month":function(t){return"Month"},"reward:export:action":function(t){return"Export to file"},"reward:export:filename":function(t){return"WMES_REWARD_"+n.v(t,"date")},"kom:title":function(t){return"Kaizen of the Month #"+n.v(t,"rid")},"kom:submit:true":function(t){return"Remove KotM status"},"kom:submit:false":function(t){return"Mark as KotM"},"coordinate:title":function(t){return"Confirming entry "+n.v(t,"rid")},"coordinate:section":function(t){return"Dział koordynujący"},"coordinate:user":function(t){return"Koordynator"},"coordinate:accept":function(t){return"Akceptuj zgłoszenie"},"coordinate:reject":function(t){return"Odrzuć zgłoszenie"},"coordinate:failure":function(t){return"Nie udało się zatwierdzić zgłoszenia."},"accept:title":function(t){return"Accepting entry "+n.v(t,"rid")},"accept:kaizenOwners":function(t){return"Kaizen owners"},"accept:kaizenOwners:required":function(t){return"Select at least one owner."},"accept:accept":function(t){return"Accept"},"accept:reject":function(t){return"Reject"},"accept:cancel":function(t){return"Cancel entry"},"accept:failure":function(t){return"Failed to accept entry."},"complete:title":function(t){return"Completing entry "+n.v(t,"rid")},"complete:accept":function(t){return"Complete"},"complete:cancel":function(t){return"Cancel entry"},"complete:failure":function(t){return"Failed to complete entry."},"verify:title":function(t){return"Verifying entry "+n.v(t,"rid")},"verify:accept":function(t){return"Finish"},"verify:reject":function(t){return"Reject"},"verify:cancel":function(t){return"Cancel entry"},"verify:failure":function(t){return"Failed to verify entry."}},pl:!0}});