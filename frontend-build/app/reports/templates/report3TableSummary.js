define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="reports-3-tableSummary">\n  <table class="stripe order-column cell-border">\n    <thead>\n      <tr>\n        <th>',t("reports","oee:division"),'</th>\n        <th data-property="prodLine">',t("reports","oee:prodLine"),"</th>\n        <th>",t("reports","oee:inventoryNo"),"</th>\n        <th>",t("reports","oee:totalAvailability"),"</th>\n        <th>",t("reports","oee:operationalAvailability:h"),"</th>\n        <th>",t("reports","oee:operationalAvailability:%"),"</th>\n        <th>",t("reports","oee:exploitation:h"),"</th>\n        <th>",t("reports","oee:exploitation:%"),'</th>\n        <th data-property="oee">',t("reports","oee:oee"),"</th>\n        <th>",t("reports","oee:adjusting:duration"),"</th>\n        <th>",t("reports","oee:maintenance:duration"),"</th>\n        <th>",t("reports","oee:renovation:duration"),"</th>\n        <th>",t("reports","oee:malfunction:duration"),"</th>\n        <th>",t("reports","oee:malfunction:count"),"</th>\n        <th>",t("reports","oee:majorMalfunction:count"),"</th>\n        <th>",t("reports","oee:mttr"),"</th>\n        <th>",t("reports","oee:mtbf"),"</th>\n      </tr>\n    </thead>\n    <tbody></tbody>\n  </table>\n</div>\n")}();return buf.join("")}});