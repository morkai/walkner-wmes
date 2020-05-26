define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<ul id="'),__append(idPrefix),__append('-searchResults" class="dropdown-menu navbar-search-results">\n  '),results.from&&(__append('\n  <li class="dropdown-header">\n    '),__append(time.format(results.from,"LL")),__append("\x3c!--\n    //--\x3e"),__append(results.shift?", "+t("SHIFT:"+results.shift):""),__append("\x3c!--\n    //--\x3e"),__append(results.division?", "+results.division:""),__append("\n  </li>\n  "),loadedModules.isLoaded("planning")&&user.isAllowedTo("PLANNING:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#planning/plans/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("NAVBAR:SEARCH:plan:prod")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#planning/wh/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("NAVBAR:SEARCH:plan:wh")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("paintShop")&&user.isAllowedTo("PAINT_SHOP:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#paintShop/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("NAVBAR:SEARCH:plan:ps")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?limit(-1337)&scheduledStartDate>='),__append(results.from),__append("&scheduledStartDate<="),__append(results.to),__append('">'),__append(t("NAVBAR:SEARCH:sapOrdersStart")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("hourlyPlans")&&user.isAllowedTo("HOURLY_PLANS:VIEW")&&(__append("\n  "),results.division?(__append('\n  <li class="navbar-search-result"><a href="#hourlyPlans/'),__append(results.fromShift),__append("/"),__append(results.division),__append('">'),__append(t("NAVBAR:SEARCH:hourlyPlan")),__append("</a></li>\n  ")):(__append('\n  <li class="navbar-search-result"><a href="#hourlyPlans?limit(-1337)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append('">'),__append(t("NAVBAR:SEARCH:hourlyPlans")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n  "),loadedModules.isLoaded("fte")&&(__append("\n  "),user.isAllowedTo("FTE:MASTER:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/master?limit(-1337)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:fte:master")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("FTE:WH:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/wh?limit(-1337)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:fte:wh")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("FTE:LEADER:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/leader?limit(-1337)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:fte:leader")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShifts?sort(createdAt)&limit(-1337)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:prodShifts")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(-1337)&startedAt>='),__append(results.fromShift),__append("&startedAt<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:prodShiftOrdersList")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(-1337)&startedAt>='),__append(results.fromShift),__append("&startedAt<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(-1337)&reqDate>='),__append(results.from),__append("&reqDate<"),__append(results.to),__append('">'),__append(t("NAVBAR:SEARCH:xiconfOrders")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(-1337)&startedAt>='),__append(results.shiftStart),__append("&startedAt<"),__append(results.shiftEnd),__append('">'),__append(t("NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.fullOrderNo&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:fullOrderNo",{orderNo:results.fullOrderNo})),__append("</li>\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders/'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:sapDetails")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders/'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:xiconfDetails")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("wh")&&user.isAllowedTo("WH:VIEW","PLANNING:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#wh/deliveredOrders?sort(date,set,startTime)&limit(-1337)&sapOrder=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:deliveredOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:prodShiftOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(-1337)&orderId=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(-1337)&orderNo=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("qi")&&user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(-1337)&orderNo=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append('\n  <li class="navbar-search-result"><a href="#fap/entries?exclude(changes)&sort(-createdAt)&limit(-1337)&orderNo=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:fapEntries")),__append("</a></li>\n  "),loadedModules.isLoaded("wmes-ct-frontend")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#ct/reports/pce?orders='),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:cycleTime")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#ct/balancing/pces?sort(-startedAt)&limit(100)&order._id=string:'),__append(results.fullOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:balancing")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.entryId&&user.isAllowedTo()&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:entryId",{entryId:results.entryId})),__append("</li>\n  "),loadedModules.isLoaded("qi")&&user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results/'),__append(results.entryId),__append('">'),__append(t("NAVBAR:SEARCH:qi")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("wmes-fap")&&(__append('\n  <li class="navbar-search-result"><a href="#fap/entries/'),__append(results.entryId),__append('">'),__append(t("NAVBAR:SEARCH:fap")),__append("</a></li>\n  ")),__append("\n  "),["kaizenOrders","suggestions","behaviorObsCards","minutesForSafetyCards"].forEach(function(e){__append("\n  "),loadedModules.isLoaded("kaizenOrders"===e?"kaizen":e)&&(__append('\n  <li class="navbar-search-result"><a href="#'),__append(e),__append("/"),__append(results.entryId),__append('">'),__append(t("NAVBAR:SEARCH:"+e)),__append("</a></li>\n  ")),__append("\n  ")}),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.fullNc12&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:fullNc12",{nc12:results.fullNc12})),__append("</li>\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#mechOrders/'),__append(results.fullNc12),__append('">szczegóły zlecenia mechanicznego</a></li>\n  <li class="navbar-search-result"><a href="#orders?sort(-scheduledStartDate)&limit(-1337)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:sapOrders")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#orders?sort(-scheduledStartDate)&limit(-1337)&bom.nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:sapOrdersBom")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(-1337)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:xiconfOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&mechOrder=true&orderId=string:'),__append(results.fullNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:worksheetOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(-1337)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("qi")&&user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(-1337)&nc12=string:'),__append(results.fullNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("kanban")&&user.isAllowedTo("USER")&&(__append('\n  <li class="navbar-search-result"><a href="#kanban?nc12='),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:kanbanEntries")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#kanban/components/'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:kanbanComponent")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("wmes-ct-frontend")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#ct/reports/pce?orders='),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:cycleTime")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#ct/balancing/pces?sort(-startedAt)&limit(100)&order.nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("NAVBAR:SEARCH:balancing")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.partialOrderNo&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:partialOrderNo",{orderNo:results.partialOrderNo})),__append("</li>\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?sort(-scheduledStartDate)&limit(-1337)&_id=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:sapList")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(-1337)&_id=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:xiconfList")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:prodShiftOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(-1337)&orderId=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(-1337)&orderNo=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("qi")&&user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(-1337)&orderNo=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.partialNc12&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:partialNc12",{nc12:results.partialNc12})),__append("</li>\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?sort(-scheduledStartDate)&limit(-1337)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("NAVBAR:SEARCH:sapOrders")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#mechOrders?limit(-1337)&_id=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("NAVBAR:SEARCH:mechOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(-1337)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("NAVBAR:SEARCH:xiconfOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&mechOrder=true&orderId=regex=%5E'),__append(results.partialNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:worksheetOrders")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("xiconf")&&user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(-1337)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("qi")&&user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(-1337)&nc12=regex=%5E'),__append(results.partialNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("kanban")&&user.isAllowedTo("USER")&&(__append('\n  <li class="navbar-search-result"><a href="#kanban?nc12='),__append(results.partialNc12),__append('">'),__append(t("NAVBAR:SEARCH:kanbanEntries")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n\n  "),results.fullNc15&&(__append('\n  <li class="dropdown-header">'),__append(t("NAVBAR:SEARCH:fullNc15",{nc15:results.fullNc15})),__append("</li>\n  "),loadedModules.isLoaded("orderDocuments")&&user.isAllowedTo("DOCUMENTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orderDocuments/tree?file='),__append(results.fullNc15),__append('">'),__append(t("NAVBAR:SEARCH:document")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("orderDocuments")&&(__append('\n  <li class="navbar-search-result"><a href="/orderDocuments/'),__append(results.fullNc15),__append('" target="_blank">'),__append(t("NAVBAR:SEARCH:documentFile")),__append("</a></li>\n  ")),__append("\n  "),loadedModules.isLoaded("production")&&user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?sort(-scheduledStartDate)&limit(-1337)&documents.nc15=string:'),__append(results.fullNc15),__append('">'),__append(t("NAVBAR:SEARCH:sapOrdersDoc")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n\n  "),results.searchName&&user.isAllowedTo("USERS:VIEW")&&(__append('\n  <li id="'),__append(idPrefix),__append('-searchName" class="dropdown-header">'),__append(t("NAVBAR:SEARCH:searchName",{nc12:results.searchName})),__append('</li>\n  <li class="navbar-search-result"><a href="#users?limit(-1337)&searchName=regex=%5E'),__append(results.searchName),__append('"><i class="fa fa-spinner fa-spin"></i></a></li>\n  ')),__append("\n</ul>\n");return __output}});