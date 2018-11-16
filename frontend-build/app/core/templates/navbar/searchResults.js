define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<ul id="'),__append(idPrefix),__append('-searchResults" class="dropdown-menu navbar-search-results">\n  '),results.from&&(__append('\n  <li class="dropdown-header">\n    '),__append(time.format(results.from,"LL")),__append("\x3c!--\n    //--\x3e"),__append(results.shift?", "+t("core","SHIFT:"+results.shift):""),__append("\x3c!--\n    //--\x3e"),__append(results.division?", "+results.division:""),__append("\n  </li>\n  "),user.isAllowedTo("PLANNING:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#planning/plans/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("core","NAVBAR:SEARCH:plan:prod")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#planning/wh/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("core","NAVBAR:SEARCH:plan:wh")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PAINT_SHOP:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#paintShop/'),__append(time.format(results.from,"YYYY-MM-DD")),__append('">'),__append(t("core","NAVBAR:SEARCH:plan:ps")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?limit(20)&scheduledStartDate>='),__append(results.from),__append("&scheduledStartDate<="),__append(results.to),__append('">'),__append(t("core","NAVBAR:SEARCH:sapOrdersStart")),__append('</a></li>\n  \x3c!-- <li class="navbar-search-result"><a href="#orders?limit(20)&scheduledFinishDate>='),__append(results.from),__append("&scheduledFinishDate<="),__append(results.to),__append('">'),__append(t("core","NAVBAR:SEARCH:sapOrdersFinish")),__append("</a></li> //--\x3e\n  ")),__append("\n  "),user.isAllowedTo("HOURLY_PLANS:VIEW")&&(__append("\n  "),results.division?(__append('\n  <li class="navbar-search-result"><a href="#hourlyPlans/'),__append(results.fromShift),__append("/"),__append(results.division),__append('">'),__append(t("core","NAVBAR:SEARCH:hourlyPlan")),__append("</a></li>\n  ")):(__append('\n  <li class="navbar-search-result"><a href="#hourlyPlans?limit(20)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append('">'),__append(t("core","NAVBAR:SEARCH:hourlyPlans")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n  "),user.isAllowedTo("FTE:MASTER:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/master?limit(20)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:fte:master")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("FTE:WH:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/wh?limit(20)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:fte:wh")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("FTE:LEADER:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#fte/leader?limit(20)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:fte:leader")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShifts?sort(createdAt)&limit(20)&date>='),__append(results.fromShift),__append("&date<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:prodShifts")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(20)&startedAt>='),__append(results.fromShift),__append("&startedAt<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:prodShiftOrdersList")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(20)&startedAt>='),__append(results.fromShift),__append("&startedAt<"),__append(results.toShift),__append(results.shift?"&shift="+results.shift:""),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(20)&reqDate>='),__append(results.from),__append("&reqDate<"),__append(results.to),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfOrders")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(20)&startedAt>='),__append(results.shiftStart),__append("&startedAt<"),__append(results.shiftEnd),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.fullOrderNo&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:fullOrderNo",{orderNo:results.fullOrderNo})),__append("</li>\n  "),user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders/'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:sapDetails")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders/'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfDetails")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&orderId=string:'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:prodShiftOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(100)&orderId=string:'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(20)&orderNo=string:'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(20)&orderNo=string:'),__append(results.fullOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.entryId&&user.isAllowedTo()&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:entryId",{entryId:results.entryId})),__append("</li>\n  "),user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results/'),__append(results.entryId),__append('">'),__append(t("core","NAVBAR:SEARCH:qi")),__append("</a></li>\n  ")),__append("\n  "),["kaizenOrders","suggestions","behaviorObsCards","minutesForSafetyCards"].forEach(function(e){__append('\n  <li class="navbar-search-result"><a href="#'),__append(e),__append("/"),__append(results.entryId),__append('">'),__append(t("core","NAVBAR:SEARCH:"+e)),__append("</a></li>\n  ")}),__append("\n  "),user.isAllowedTo("D8:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#d8/entries/'),__append(results.entryId),__append('">'),__append(t("core","NAVBAR:SEARCH:d8")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.fullNc12&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:fullNc12",{nc12:results.fullNc12})),__append("</li>\n  "),user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#mechOrders/'),__append(results.fullNc12),__append('">szczegóły zlecenia mechanicznego</a></li>\n  <li class="navbar-search-result"><a href="#orders?sort(scheduledStartDate)&limit(20)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:sapOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(20)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&mechOrder=true&orderId=string:'),__append(results.fullNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:worksheetOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(20)&nc12=string:'),__append(results.fullNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(20)&nc12=string:'),__append(results.fullNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.partialOrderNo&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:partialOrderNo",{orderNo:results.partialOrderNo})),__append("</li>\n  "),user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?sort(scheduledStartDate)&limit(20)&_id=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:sapList")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(20)&_id=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfList")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&orderId=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:prodShiftOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodDowntimes?sort(startedAt)&limit(100)&orderId=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:prodDowntimes")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(20)&orderNo=regex=%5E'),__append(results.partialOrderNo),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(20)&orderNo=regex=%5E'),__append(results.partialOrderNo),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append('\n  <li class="divider"></li>\n  ')),__append("\n\n  "),results.partialNc12&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:partialNc12",{nc12:results.partialNc12})),__append("</li>\n  "),user.isAllowedTo("ORDERS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#orders?sort(scheduledStartDate)&limit(20)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:sapOrders")),__append('</a></li>\n  <li class="navbar-search-result"><a href="#mechOrders?limit(20)&_id=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:mechOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/orders?sort(-reqDate)&limit(20)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#prodShiftOrders?sort(startedAt)&limit(100)&mechOrder=true&orderId=regex=%5E'),__append(results.partialNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:worksheetOrders")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("XICONF:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#xiconf/results?exclude(log,metrics,leds)&sort(startedAt)&limit(20)&nc12=regex=%5E'),__append(results.partialNc12),__append('">'),__append(t("core","NAVBAR:SEARCH:xiconfResults")),__append("</a></li>\n  ")),__append("\n  "),user.isAllowedTo("QI:RESULTS:VIEW")&&(__append('\n  <li class="navbar-search-result"><a href="#qi/results?sort(-inspectedAt,-rid)&limit(20)&nc12=regex=%5E'),__append(results.partialNc12),__append(results.division?"&division="+results.division:""),__append('">'),__append(t("core","NAVBAR:SEARCH:qiResults")),__append("</a></li>\n  ")),__append("\n  ")),__append("\n\n  "),results.fullNc15&&user.isAllowedTo("DOCUMENTS:VIEW")&&(__append('\n  <li class="dropdown-header">'),__append(t("core","NAVBAR:SEARCH:fullNc15",{nc15:results.fullNc15})),__append('</li>\n  <li class="navbar-search-result"><a href="#orderDocuments/tree?file='),__append(results.fullNc15),__append('">'),__append(t("core","NAVBAR:SEARCH:document")),__append('</a></li>\n  <li class="navbar-search-result"><a href="/orderDocuments/'),__append(results.fullNc15),__append('" target="_blank">'),__append(t("core","NAVBAR:SEARCH:documentFile")),__append("</a></li>\n  ")),__append("\n</ul>\n");return __output.join("")}});