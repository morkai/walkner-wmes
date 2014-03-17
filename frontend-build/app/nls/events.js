define(["app/nls/locale/en"],function(e){var d={locale:{}};return d.locale.en=e,{root:{"MSG:LOADING_FAILURE":function(){return"Failed to load the events :("},"MSG:LOADING_TYPES_FAILURE":function(){return"Failed to load the event types :("},"BREADCRUMBS:browse":function(){return"Events"},"FILTER:DATE:FROM":function(){return"From"},"FILTER:DATE:TO":function(){return"To"},"FILTER:PLACEHOLDER:type":function(){return"Any type"},"FILTER:PLACEHOLDER:user":function(){return"Any user"},"FILTER:SYSTEM_USER":function(){return"System"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:BUTTON":function(){return"Filter events"},"PROPERTY:time":function(){return"Time of occurrence"},"PROPERTY:user":function(){return"User"},"PROPERTY:type":function(){return"Type"},"PROPERTY:text":function(){return"Description"},"PROPERTY:severity":function(){return"Severity"},"TYPE:app.started":function(){return"System start"},"TEXT:app.started":function(e){return"<em>"+s(e,"id",{frontend:"Application server",importer:"Importer server",other:"Server "+v(e,"id")})+"</em> started in the <em>"+s(e,"env",{development:"development",production:"production",other:"unspecified"})+"</em> environment in <em>"+v(e,"time")+"</em> ms."},"TYPE:users.login":function(){return"Users: log in"},"TEXT:users.login":function(){return"-"},"TYPE:users.loginFailure":function(){return"Users: log in failure"},"TEXT:users.loginFailure":function(e){return"Failed log in to account: <em>"+v(e,"login")+"</em>"},"TYPE:users.logout":function(){return"Users: log out"},"TEXT:users.logout":function(){return"-"},"TYPE:users.added":function(){return"Users: added"},"TEXT:users.added":function(e){return"Added user: <a href='#users/"+v(e,"model->_id")+"'>"+v(e,"model->login")+"</a>"},"TYPE:users.edited":function(){return"Users: edited"},"TEXT:users.edited":function(e){return"Edited user: <a href='#users/"+v(e,"model->_id")+"'>"+v(e,"model->login")+"</a>"},"TYPE:users.deleted":function(){return"Users: deleted"},"TEXT:users.deleted":function(e){return"Deleted user: <em>"+v(e,"model->login")+"</em>"},"TYPE:users.synced":function(){return"Users: synchronization"},"TEXT:users.synced":function(e){return"Added "+p(e,"created",0,"en",{one:"1 new user",other:n(e,"created")+" new users"})+" and modified "+p(e,"updated",0,"en",{one:"1 existing user",other:n(e,"updated")+" existing users"})+" during synchronization with the AC database."},"TYPE:users.syncFailed":function(){return"Users: synchronization failure"},"TEXT:users.syncFailed":function(e){return"Failed to synchronize users with the AC database: <em>"+v(e,"error")+"</em>"},"TYPE:mechOrders.edited":function(){return"Mechanical orders: edited"},"TEXT:mechOrders.edited":function(e){return"Edited mechanical order: <a href='#mechOrders/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:mechOrders.synced":function(){return"Mechanical orders: import"},"TEXT:mechOrders.synced":function(e){return"Imported "+p(e,"count",0,"en",{one:"1 mechanical order",other:n(e,"count")+" mechanical orders"})+"."},"TYPE:emptyOrders.synced":function(){return"Empty orders: synchronization"},"TEXT:emptyOrders.synced":function(e){return"Added "+p(e,"count",0,"en",{one:"1 new empty order",other:n(e,"count")+" new empty orders"})+"."},"TYPE:orders.synced":function(){return"Production orders: synchronization"},"TEXT:orders.synced":function(e){return"Added "+v(e,"created")+" new and edited "+p(e,"updated",0,"en",{one:"1 existing order",other:n(e,"updated")+" existing orders"})+s(e,"moduleName",{currentDayOrderImporter:"&nbsp;from the current day",nextDayOrderImporter:"&nbsp;from the next day",prevDayOrderImporter:"&nbsp;from the previous day",other:""})+"."},"TYPE:orderStatuses.added":function(){return"Order statuses: added"},"TEXT:orderStatuses.added":function(e){return"Added order status: <a href='#orderStatuses/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:orderStatuses.edited":function(){return"Order statuses: edited"},"TEXT:orderStatuses.edited":function(e){return"Edited order status: <a href='#orderStatuses/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:orderStatuses.deleted":function(){return"Order statuses: deleted"},"TEXT:orderStatuses.deleted":function(e){return"Deleted order status: <em>"+v(e,"model->_id")+"</em>"},"TYPE:downtimeReasons.added":function(){return"Downtime reasons: added"},"TEXT:downtimeReasons.added":function(e){return"Added downtime reason: <a href='#downtimeReasons/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.edited":function(){return"Downtime reasons: edited"},"TEXT:downtimeReasons.edited":function(e){return"Edited downtime reason: <a href='#downtimeReasons/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.deleted":function(){return"Downtime reasons: deleted"},"TEXT:downtimeReasons.deleted":function(e){return"Deleted downtime reason: <em>"+v(e,"model->_id")+"</em>"},"TYPE:lossReasons.added":function(){return"Loss reasons: added"},"TEXT:lossReasons.added":function(e){return"Added loss reason: <a href='#lossReasons/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:lossReasons.edited":function(){return"Loss reasons: edited"},"TEXT:lossReasons.edited":function(e){return"Edited loss reason: <a href='#lossReasons/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:lossReasons.deleted":function(){return"Loss reasons: deleted"},"TEXT:lossReasons.deleted":function(e){return"Deleted loss reason: <em>"+v(e,"model->_id")+"</em>"},"TYPE:aors.added":function(){return"Areas of responsibility: added"},"TEXT:aors.added":function(e){return"Added area of responsibility: <a href='#aors/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:aors.edited":function(){return"Areas of responsibility: edited"},"TEXT:aors.edited":function(e){return"Edited area of responsibility: <a href='#aors/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:aors.deleted":function(){return"Areas of responsibility: deleted"},"TEXT:aors.deleted":function(e){return"Deleted area of responsibility: <em>"+v(e,"model->name")+"</em>"},"TYPE:workCenters.added":function(){return"WorkCenters: added"},"TEXT:workCenters.added":function(e){return"Added WorkCenter: <a href='#workCenters/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:workCenters.edited":function(){return"WorkCenters: edited"},"TEXT:workCenters.edited":function(e){return"Edited WorkCenter: <a href='#workCenters/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:workCenters.deleted":function(){return"WorkCenters: deleted"},"TEXT:workCenters.deleted":function(e){return"Deleted WorkCenter: <em>"+v(e,"model->_id")+"</em>"},"TYPE:divisions.added":function(){return"Divisions: added"},"TEXT:divisions.added":function(e){return"Added division: <a href='#divisions/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:divisions.edited":function(){return"Divisions: edited"},"TEXT:divisions.edited":function(e){return"Edited division: <a href='#divisions/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:divisions.deleted":function(){return"Divisions: deleted"},"TEXT:divisions.deleted":function(e){return"Deleted division: <em>"+v(e,"model->_id")+"</em>"},"TYPE:subdivisions.added":function(){return"Subdivisions: added"},"TEXT:subdivisions.added":function(e){return"Added subdivision: <a href='#subdivisions/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:subdivisions.edited":function(){return"Subdivisions: edited"},"TEXT:subdivisions.edited":function(e){return"Edited subdivision: <a href='#subdivisions/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:subdivisions.deleted":function(){return"Subdivisions: deleted"},"TEXT:subdivisions.deleted":function(e){return"Deleted subdivision: <em>"+v(e,"model->name")+"</em>"},"TYPE:companies.added":function(){return"Companies: added"},"TEXT:companies.added":function(e){return"Added company: <a href='#companies/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:companies.edited":function(){return"Companies: edited"},"TEXT:companies.edited":function(e){return"Edited company: <a href='#companies/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:companies.deleted":function(){return"Companies: deleted"},"TEXT:companies.deleted":function(e){return"Deleted company: <em>"+v(e,"model->name")+"</em>"},"TYPE:mrpControllers.added":function(){return"MRP Controllers: added"},"TEXT:mrpControllers.added":function(e){return"Added MRP Controller: <a href='#mrpControllers/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:mrpControllers.edited":function(){return"MRP Controllers: edited"},"TEXT:mrpControllers.edited":function(e){return"Edited MRP Controller: <a href='#mrpControllers/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:mrpControllers.deleted":function(){return"MRP Controllers: deleted"},"TEXT:mrpControllers.deleted":function(e){return"Deleted MRP Controller: <em>"+v(e,"model->_id")+"</em>"},"TYPE:prodLines.added":function(){return"Production line: added"},"TEXT:prodLines.added":function(e){return"Added production line: <a href='#prodLines/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:prodLines.edited":function(){return"Production line: edited"},"TEXT:prodLines.edited":function(e){return"Edited production line: <a href='#prodLines/"+v(e,"model->_id")+"'>"+v(e,"model->_id")+"</a>"},"TYPE:prodLines.deleted":function(){return"Production line: deleted"},"TEXT:prodLines.deleted":function(e){return"Deleted production line: <em>"+v(e,"model->_id")+"</em>"},"TYPE:prodTasks.added":function(){return"Production tasks: added"},"TEXT:prodTasks.added":function(e){return"Added production task: <a href='#prodTasks/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:prodTasks.edited":function(){return"Production tasks: edited"},"TEXT:prodTasks.edited":function(e){return"Edited production task: <a href='#prodTasks/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:prodTasks.deleted":function(){return"Production tasks: deleted"},"TEXT:prodTasks.deleted":function(e){return"Deleted production task: <em>"+v(e,"model->name")+"</em>"},"TYPE:prodFlows.added":function(){return"Production flows: added"},"TEXT:prodFlows.added":function(e){return"Added production flow: <a href='#prodFlows/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:prodFlows.edited":function(){return"Production flows: edited"},"TEXT:prodFlows.edited":function(e){return"Edited production flow: <a href='#prodFlows/"+v(e,"model->_id")+"'>"+v(e,"model->name")+"</a>"},"TYPE:prodFlows.deleted":function(){return"Production flows: deleted"},"TEXT:prodFlows.deleted":function(e){return"Deleted production flow: <em>"+v(e,"model->name")+"</em>"},"TYPE:prodFunctions.added":function(){return"Production functions: added"},"TEXT:prodFunctions.added":function(e){return"Added production function: <a href='#prodFunctions/"+v(e,"model->_id")+"'>"+v(e,"model->label")+"</a>"},"TYPE:prodFunctions.edited":function(){return"Production functions: edited"},"TEXT:prodFunctions.edited":function(e){return"Edited production function: <a href='#prodFunctions/"+v(e,"model->_id")+"'>"+v(e,"model->label")+"</a>"},"TYPE:prodFunctions.deleted":function(){return"Production functions: deleted"},"TEXT:prodFunctions.deleted":function(e){return"Deleted production function: <em>"+v(e,"model->label")+"</em>"},"TYPE:fte.leader.created":function(){return"FTE (distribution): added"},"TEXT:fte.leader.created":function(e){return"Created <a href='#fte/leader/"+v(e,"model->_id")+"'>a new FTE (distribution) entry</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for subdivision <em>"+v(e,"model->subdivision")+"</em>."},"TYPE:fte.leader.locked":function(){return"FTE (distribution): locked"},"TEXT:fte.leader.locked":function(e){return"Locked <a href='#fte/leader/"+v(e,"model->_id")+"'>an FTE (distribution) entry</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for subdivision <em>"+v(e,"model->subdivision")+"</em>."},"TYPE:fte.master.created":function(){return"FTE (production): added"},"TEXT:fte.master.created":function(e){return"Created <a href='#fte/master/"+v(e,"model->_id")+"'>a new FTE (production) entry</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for subdivision <em>"+v(e,"model->subdivision")+"</em>."},"TYPE:fte.master.locked":function(){return"FTE (production): locked"},"TEXT:fte.master.locked":function(e){return"Locked <a href='#fte/master/"+v(e,"model->_id")+"'>an FTE (production) entry</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for subdivision <em>"+v(e,"model->subdivision")+"</em>."},"TYPE:hourlyPlans.created":function(){return"Plany godzinowe: added"},"TEXT:hourlyPlans.created":function(e){return"Created <a href='#hourlyPlans/"+v(e,"model->_id")+"'>a new hourly plan</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for division <em>"+v(e,"model->division")+"</em>."},"TYPE:hourlyPlans.locked":function(){return"Plany godzinowe: locked"},"TEXT:hourlyPlans.locked":function(e){return"Locked <a href='#hourlyPlans/"+v(e,"model->_id")+"'>an hourly plan</a> for <em>"+v(e,"model->shift")+"</em>. shift of <em>"+v(e,"model->date")+"</em> for division <em>"+v(e,"model->division")+"</em>."},"TYPE:pressWorksheets.added":function(){return"Karty pracy: added"},"TEXT:pressWorksheets.added":function(e){return"Added <a href='#pressWorksheets/"+v(e,"model->_id")+"'>a new worksheet</a>."},"TYPE:feedback.added":function(){return"Feedback: added"},"TEXT:feedback.added":function(){return"Added new feedback."}},pl:!0}});