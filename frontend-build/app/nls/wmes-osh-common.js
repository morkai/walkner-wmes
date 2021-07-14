define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,i,o){return t.c(n,e),n[e]in o?o[n[e]]:(e=t.lc[i](n[e]-r))in o?o[e]:o.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"navbar:hr":function(n){return"HR"},"navbar:users":function(n){return"Users"},"navbar:employments":function(n){return"Employment"},"navbar:targets":function(n){return"Targets"},"navbar:brigades":function(n){return"Brigades"},"navbar:companies":function(n){return"Companies"},"navbar:divisions":function(n){return"Divisions"},"navbar:workplaces":function(n){return"Workplaces"},"navbar:departments":function(n){return"Departments"},"navbar:buildings":function(n){return"Buildings"},"navbar:locations":function(n){return"Areas"},"navbar:stations":function(n){return"Workstations"},"navbar:kinds":function(n){return"Entry kinds"},"navbar:activityKinds":function(n){return"Activity kinds"},"navbar:observationKinds":function(n){return"Observation kinds"},"navbar:observationCategories":function(n){return"Observation categories"},"navbar:eventCategories":function(n){return"Event categories"},"navbar:reasonCategories":function(n){return"Reason categories"},"navbar:rootCauseCategories":function(n){return"Root cause categories"},"navbar:kaizenCategories":function(n){return"Kaizen categories"},"navbar:nearMisses":function(n){return"Near miss"},"navbar:kaizens":function(n){return"Kaizen"},"navbar:actions":function(n){return"Actions"},"navbar:observations":function(n){return"Observations"},"navbar:accidents":function(n){return"Accidents"},"navbar:reports":function(n){return"Reports"},"navbar:reports:metrics":function(n){return"Metrics"},"navbar:reports:engagement":function(n){return"Engagement"},"navbar:reports:observers":function(n){return"Observers"},"navbar:reports:rewards":function(n){return"Rewards"},"navbar:reports:count/nearMiss":function(n){return"Near miss count"},"navbar:reports:count/kaizen":function(n){return"Kaizen count"},"navbar:reports:count/action":function(n){return"Action count"},"navbar:reports:count/observation":function(n){return"Observation count"},"navbar:reports:count/accident":function(n){return"Accident count"},"navbar:entries:all":function(n){return"All"},"navbar:entries:open":function(n){return"Open"},"navbar:entries:mine":function(n){return"Mine"},"navbar:entries:unseen":function(n){return"Unread"},"navbar:entries:todo":function(n){return"Todo"},"navbar:search:nearMiss":function(n){return"near miss"},"navbar:search:kaizen":function(n){return"kaizen"},"navbar:search:action":function(n){return"action"},"navbar:search:observation":function(n){return"observation"},"navbar:search:accident":function(n){return"accident"},"type:nearMiss":function(n){return"Near miss"},"type:kaizen":function(n){return"Kaizen"},"type:action":function(n){return"Action"},"type:observation":function(n){return"Observation"},"type:accident":function(n){return"Accident"},"priority:0":function(n){return"Low"},"priority:1":function(n){return"Normal"},"priority:2":function(n){return"High"},"priority:3":function(n){return"Critical"},"kind:osh":function(n){return"OSH"},"kind:env":function(n){return"Environment"},"kind:inf":function(n){return"Infrastructure"},"kind:other":function(n){return"Other"},"status:new":function(n){return"New"},"status:inProgress":function(n){return"In progress"},"status:verification":function(n){return"Verification"},"status:finished":function(n){return"Finished"},"status:paused":function(n){return"Paused"},"status:cancelled":function(n){return"Cancelled"},"status:nom":function(n){return"Nomination"},"status:kom":function(n){return"Kaizen of the Month"},"kom:0":function(n){return"No"},"kom:1":function(n){return"Nomination"},"kom:2":function(n){return"Yes"},"orgUnit:divisions":function(n){return"Divisions"},"orgUnit:division":function(n){return"Division"},"orgUnit:workplaces":function(n){return"Workplaces"},"orgUnit:workplace":function(n){return"Workplace"},"orgUnit:departments":function(n){return"Departments"},"orgUnit:department":function(n){return"Department"},"orgUnit:buildings":function(n){return"Buildings"},"orgUnit:building":function(n){return"Building"},"orgUnit:locations":function(n){return"Areas"},"orgUnit:location":function(n){return"Area"},"orgUnit:stations":function(n){return"Workstations"},"orgUnit:station":function(n){return"Workstation"},"duration:days":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"en",{one:"day",other:"days"})},"duration:hours":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"en",{one:"hour",other:"hours"})},"duration:minutes":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"en",{one:"minute",other:"minutes"})},"anonymous:label":function(n){return"Anonymous"},"attachments:panelTitle:default":function(n){return"Attachments"},"attachments:panelTitle:other":function(n){return"Attachments"},"attachments:panelTitle:before":function(n){return"Photos of the state before"},"attachments:panelTitle:after":function(n){return"Photos of the state after"},"attachments:empty":function(n){return"No files were attached."},"attachments:open":function(n){return"Open file"},"attachments:edit":function(n){return"Edit attachment"},"attachments:edit:title":function(n){return"Editing attachment"},"attachments:edit:name":function(n){return"File name"},"attachments:edit:kind":function(n){return"Attachment kind"},"attachments:edit:submit":function(n){return"Save"},"attachments:delete":function(n){return"Delete attachment"},"attachments:delete:title":function(n){return"Deleting attachment"},"attachments:delete:message":function(n){return"Are you sure you want to delete the specified attachment?"},"attachments:delete:yes":function(n){return"Delete attachment"},"attachments:kind:before":function(n){return"state before"},"attachments:kind:after":function(n){return"state after"},"attachments:kind:other":function(n){return"other"},"history:panelTitle":function(n){return"Changelog"},"history:maximize":function(n){return"Maximize view"},"history:commentsOnly":function(n){return"Comments only"},"history:comment:placeholder":function(n){return"Comment..."},"history:comment:submit":function(n){return"Comment"},"history:attachmentKind:before":function(n){return"before"},"history:attachmentKind:after":function(n){return"after"},"relation:unspecified":function(n){return""},"relation:nearMiss":function(n){return"<a href='#osh/nearMisses/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:action":function(n){return"<a href='#osh/actions/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:kaizen":function(n){return"<a href='#osh/kaizens/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:observation":function(n){return"<a href='#osh/observations/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"markAsSeen:listAction":function(n){return"Mark as read"},"markAsSeen:pageAction:list":function(n){return"Mark as read"},"markAsSeen:pageAction:details":function(n){return"Mark as read"},"markAsSeen:success":function(n){return t.p(n,"count",0,"en",{0:"All entries read!",one:"One entry read.",other:"Read "+t.v(n,"count")+" entries."})},"markAsSeen:failure":function(n){return"Failed to mark entries as read."},"markAsSeen:noComment":function(n){return"Changes without comments"},"markAsSeen:finished":function(n){return"Finished"},"markAsSeen:dayOld":function(n){return"Older than a day"},"markAsSeen:weekOld":function(n){return"Older than a week"},"markAsSeen:all":function(n){return"Everything"},"FORM:ERROR:upload":function(n){return"Failed to save attachments."},"FORM:ERROR:tooManyFiles":function(n){return"You can attach at most "+t.v(n,"max")+" "+t.p(n,"max",0,"en",{1:"file",other:"files"})+"."},"FORM:ACTION:add":function(n){return"Add entry"},"FORM:ACTION:edit":function(n){return"Save"},"FORM:ACTION:title:edit":function(n){return"Save the entry without changing its status"},"FORM:ACTION:title:status":function(n){return"Save the entry and change its status to: "+t.v(n,"status")},"FORM:ACTION:title:cancel:add":function(n){return"Go back to the previous page without adding a new entry"},"FORM:ACTION:title:cancel:edit":function(n){return"Go back to the previous page without changing the entry"},"FORM:ACTION:inProgress":function(n){return"Accept for resolution"},"FORM:ACTION:correction":function(n){return"Reject for correction"},"FORM:ACTION:verification":function(n){return"Send for verification"},"FORM:ACTION:finished":function(n){return"Finish"},"FORM:ACTION:paused":function(n){return"Pause"},"FORM:ACTION:cancelled":function(n){return"Cancel entry"},"FORM:ACTION:cancel:add":function(n){return"Cancel adding"},"FORM:ACTION:cancel:edit":function(n){return"Discard changes"},"FORM:placeholder:noUserWorkplace":function(n){return"Select the creator's workplace..."},"FORM:placeholder:noDivision":function(n){return"Select a division..."},"FORM:placeholder:noWorkplace":function(n){return"Select a workplace..."},"FORM:placeholder:noDepartment":function(n){return"Select a department..."},"FORM:placeholder:noBuilding":function(n){return"Select a building..."},"FORM:placeholder:noLocation":function(n){return"Select an area..."},"FORM:unsaved":function(n){return"Changes will not be saved."},"orgUnitPicker:filter:label":function(n){return"Organizational units "},"orgUnitPicker:filter:any":function(n){return"Any"},"orgUnitPicker:dialog:title":function(n){return"Organizational units "},"orgUnitPicker:dialog:submit":function(n){return"Select"},"orgUnitPicker:dialog:deactivated":function(n){return"Deactivated"},"coordinators:types":function(n){return"Entry types"},"coordinators:kinds":function(n){return"Entry kinds"},"coordinators:users":function(n){return"Users"},"coordinators:add":function(n){return"Add coordinators"},"coordinators:all":function(n){return"All"}},pl:!0}});