define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<table class="table table-bordered table-condensed pressWorksheets-form-orders">\n  <thead>\n    <tr>\n      <th rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.part"),'</th>\n      <th rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.operation"),'</th>\n      <th class="pressWorksheets-form-min" rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.prodLine"),'</th>\n      <th class="pressWorksheets-form-min" rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.quantityDone"),'</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.startedAt"),'</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="',rowspan,'">',t("pressWorksheets","PROPERTY:order.finishedAt"),"</th>\n      "),lossReasons.length&&buf.push('\n      <th class="pressWorksheets-form-min pressWorksheets-form-separator" colspan="',lossReasons.length,'">',t("pressWorksheets","PROPERTY:order.losses"),"</th>\n      "),buf.push("\n      "),downtimeReasons.length&&buf.push('\n      <th class="pressWorksheets-form-min pressWorksheets-form-separator" colspan="',downtimeReasons.length,'">',t("pressWorksheets","PROPERTY:order.downtimes"),"</th>\n      "),buf.push("\n    </tr>\n    "),rowspan&&(buf.push('\n    <tr class="pressWorksheets-form-losses">\n      '),lossReasons.forEach(function(e,t){buf.push('\n      <th class="',t?"":"pressWorksheets-form-separator",'"><span class="pressWorksheets-form-loss">',e.label,"</span></th>\n      ")}),buf.push("\n      "),downtimeReasons.forEach(function(e,t){buf.push('\n      <th class="',t?"":"pressWorksheets-form-separator",'"><span class="pressWorksheets-form-loss">',e.label,"</span></th>\n      ")}),buf.push("\n    </tr>\n    ")),buf.push("\n  </thead>\n  <tbody></tbody>\n</table>\n")}();return buf.join("")}});