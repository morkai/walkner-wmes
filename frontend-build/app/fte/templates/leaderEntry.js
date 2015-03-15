define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="well">\n    <div class="fte-property">\n      <span class="fte-property-name">',t("core","ORG_UNIT:subdivision"),'</span>\n      <span class="fte-property-value">',subdivision,'</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">',t("fte","property:date"),'</span>\n      <span class="fte-property-value">',date,'</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">',t("fte","property:shift"),'</span>\n      <span class="fte-property-value">',shift,'</span>\n    </div>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">',t("fte","leaderEntry:panel:title"+(editable?":editable":"")),"</div>\n    "),editable&&buf.push('\n    <div class="message message-inline message-info">',t("fte","panel:info"),"</div>\n    "),buf.push("\n    "),buf.push(totalByProdFunction?"\n    "+function(){var n=[];return n.push('<div class="table-responsive">\n<table class="table table-bordered table-condensed table-hover fte-leaderEntry ',editable?"is-editable":"",'">\n  <thead>\n    <tr>\n      <th class="fte-leaderEntry-column-task" rowspan="',divisions.length?6:4,'">',t("fte","leaderEntry:column:task"),'\n      <th class="fte-leaderEntry-column-total even" colspan="',companyCount*(divisions.length||1),'">',t("fte","leaderEntry:column:taskTotal"),"</th>\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push('\n      <th class="fte-leaderEntry-column-prodFunction ',a%2?"even":"",'" colspan="',Object.keys(totalByProdFunction[t].companies).length*(divisions.length||1),'" data-column="',a,'">',totalByProdFunction[t].prodFunction,"</th>\n      ")}),n.push("\n      "),editable&&n.push('\n      <th rowspan="',divisions.length?6:4,'"></th>\n      '),n.push('\n    </tr>\n    <tr>\n      <th class="fte-leaderEntry-total even" colspan="',companyCount*(divisions.length||1),'">',round(total),"\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push('\n      <th class="fte-leaderEntry-total-prodFunction ',a%2?"even":"",'" colspan="',Object.keys(totalByProdFunction[t].companies).length*(divisions.length||1),'" data-column="',a,'">',round(totalByProdFunction[t].total),"\n      ")}),n.push("\n    </tr>\n    <tr>\n      "),Object.keys(totalByCompany).forEach(function(t){n.push('\n      <th class="fte-leaderEntry-column-company even" colspan="',divisions.length,'">',totalByCompany[t].name,"\n      ")}),n.push("\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push("\n      "),Object.keys(totalByProdFunction[t].companies).forEach(function(e){n.push('\n      <th class="fte-leaderEntry-column-company ',a%2?"even":"",'" colspan="',divisions.length,'" data-column="',a,":",totalByProdFunction[t].companies[e].index,'">',escape(totalByCompany[e].name),"\n      ")}),n.push("\n      ")}),n.push("\n    </tr>\n    <tr>\n      "),Object.keys(totalByCompany).forEach(function(t){n.push('\n      <th class="fte-leaderEntry-total-company even" colspan="',divisions.length,'" data-company="',totalByCompany[t].index,'">',round(totalByCompany[t].total),"\n      ")}),n.push("\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push("\n      "),Object.keys(totalByProdFunction[t].companies).forEach(function(e){n.push('\n      <th class="fte-leaderEntry-total-prodFunction-company ',a%2?"even":"",'" colspan="',divisions.length,'" data-function="',a,'" data-company="',totalByProdFunction[t].companies[e].index,'" data-column="',a,":",totalByProdFunction[t].companies[e].index,'">',round(totalByProdFunction[t].companies[e].total),"\n      ")}),n.push("\n      ")}),n.push("\n    </tr>\n    "),divisions.length&&(n.push("\n    <tr>\n      "),Object.keys(totalByCompany).forEach(function(){n.push("\n      "),divisions.forEach(function(t){n.push('\n      <th class="fte-leaderEntry-column-division even">',t,"\n      ")}),n.push("\n      ")}),n.push("\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push("\n      "),Object.keys(totalByProdFunction[t].companies).forEach(function(e){n.push("\n      "),divisions.forEach(function(o,s){n.push('\n      <th class="fte-leaderEntry-column-division ',a%2?"even":"",'" data-column="',a,":",totalByProdFunction[t].companies[e].index,":",s,'">',o,"\n      ")}),n.push("\n      ")}),n.push("\n      ")}),n.push("\n    </tr>\n    <tr>\n      "),Object.keys(totalByCompany).forEach(function(t){n.push("\n      "),divisions.forEach(function(a,e){n.push('\n      <th class="fte-leaderEntry-total-division even" data-column="',totalByCompany[t].index,":",e,'" data-company="',totalByCompany[t].index,'" data-division="',e,'">',round(totalByCompany[t].divisions[a]),"\n      ")}),n.push("\n      ")}),n.push("\n      "),Object.keys(totalByProdFunction).forEach(function(t,a){n.push("\n      "),Object.keys(totalByProdFunction[t].companies).forEach(function(e){n.push("\n      "),divisions.forEach(function(o,s){n.push('\n      <th class="fte-leaderEntry-total-prodFunction-division ',a%2?"even":"",'" data-column="',a,":",totalByProdFunction[t].companies[e].index,":",s,'" data-company="',totalByProdFunction[t].companies[e].index,'" data-division="',s,'">',round(totalByProdFunction[t].companies[e].divisions[o]),"\n      ")}),n.push("\n      ")}),n.push("\n      ")}),n.push("\n    </tr>\n    ")),n.push("\n  </thead>\n  <tbody>\n    "),tasks.forEach(function(t){n.push('\n    <tr class="',t.parent?"is-child":""," ",t.hasChildren?"is-parent":""," ",t.parent||t.hasChildren?"":"is-single"," ",t.last?"is-last":""," ",t.lastChild?"is-last-child":""," ",t.comment?"has-visible-comment":"has-invisible-comment",'"\n        data-id="',t.id,'"\n        data-parent="',t.parent,'"\n        data-level="',t.level,'"\n        '),t.backgroundColor&&n.push('style="background-color: ',t.backgroundColor,'"'),n.push('>\n      <td class="fte-leaderEntry-cell-task" '),t.level&&n.push('style="padding-left: ',30*t.level,'px;"'),n.push(">\n        ",escape(t.name),"\n        "),!editable&&t.comment&&n.push('\n        <span class="fte-leaderEntry-comment"><i class="fa fa-comment"></i> ',escape(t.comment),"</span>\n        "),n.push("\n      </td>\n      "),Object.keys(t.totalByCompany).forEach(function(a){n.push("\n      "),t.fteDiv?(n.push("\n      "),divisions.forEach(function(e,o){n.push('\n      <td class="fte-leaderEntry-total-company-task even" data-companyId="',t.totalByCompany[a].index,'" data-company="',t.totalByCompany[a].index,'" data-divisionId="',e,'" data-division="',o,'">',round(t.totalByCompany[a].divisions[e]),"</td>\n      ")}),n.push("\n      ")):n.push('\n      <td class="fte-leaderEntry-total-company-task even" colspan="',divisions.length,'" data-company="',t.totalByCompany[a].index,'">',round(t.totalByCompany[a].total),"</td>\n      "),n.push("\n      ")}),n.push("\n      "),t.functions.forEach(function(a,e){n.push("\n      "),a.companies.forEach(function(a,o){n.push("\n      "),t.fteDiv?(n.push("\n      "),a.count.forEach(function(s,l){n.push('\n      <td class="',t.hasChildren?"fte-leaderEntry-parent-count":"fte-leaderEntry-count-container"," ",e%2?"even":"",'" data-function="',e,'" data-company="',a.index,'" data-division="',l,'" data-level="',t.level,'">\n        '),editable&&!t.hasChildren?n.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="',s.value,'"\n          data-value="',s.value,'"\n          data-task="',t.index,'"\n          data-function="',e,'"\n          data-company="',a.index,'"\n          data-company-server="',o,'"\n          data-division="',l,'">\n        '):n.push("\n        ",round(s.value),"\n        "),n.push("\n      </td>\n      ")}),n.push("\n      ")):(n.push('\n      <td class="',t.hasChildren?"fte-leaderEntry-parent-count":"fte-leaderEntry-count-container"," ",e%2?"even":"",'" colspan="',divisions.length,'" data-function="',e,'" data-company="',a.index,'">\n        '),editable&&!t.hasChildren?n.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="',a.count,'"\n          data-value="',a.count,'"\n          data-task="',t.index,'"\n          data-function="',e,'"\n          data-company="',a.index,'"\n          data-company-server="',o,'">\n        '):n.push("\n        ",round(a.count),"\n        "),n.push("\n      </td>\n      ")),n.push("\n      ")}),n.push("\n      ")}),n.push("\n      "),editable&&n.push('\n      <td class="fte-leaderEntry-actions"><button class="btn btn-default fte-leaderEntry-toggleComment" tabindex="-1"><i class="fa fa-comment"></i></button></td>\n      '),n.push("\n    </tr>\n    "),editable&&n.push('\n    <tr class="fte-leaderEntry-comment ',t.comment?"":"hidden",'">\n      <td colspan="999">\n        <textarea class="form-control fte-leaderEntry-comment" rows="2" data-task="',t.index,'">',escape(t.comment||""),"</textarea>\n      </td>\n    </tr>\n    "),n.push("\n    ")}),n.push("\n  </tbody>\n</table>\n</div>\n"),n.join("")}()+"\n    ":"\n    "+function(){var n=[];return n.push('<table class="table table-bordered table-condensed table-hover fte-leaderEntry">\n  <thead>\n    <tr>\n      <th class="fte-leaderEntry-column-task" rowspan="3">',t("fte","leaderEntry:column:task"),"\n      <th>",t("fte","leaderEntry:column:taskTotal"),"\n      "),companies.forEach(function(t,a){n.push('\n      <th class="fte-leaderEntry-column-company" colspan="',divisions.length,'" data-column="',a,'">',escape(t.name),"\n      ")}),n.push('\n    </tr>\n    <tr>\n      <th class="fte-leaderEntry-total-overall" rowspan="2">',round(total),"\n      "),companies.forEach(function(t,a){n.push('\n      <th class="fte-leaderEntry-total-company" colspan="',divisions.length,'" data-column="',escape(a),'">',round(t.total),"\n      ")}),n.push("\n    </tr>\n    "),divisions.length&&(n.push("\n    <tr>\n      "),companies.forEach(function(t,a){n.push("\n      "),divisions.forEach(function(t,e){n.push('\n      <th class="fte-leaderEntry-column-division" data-column="',a,":",e,'">',t,"\n      ")}),n.push("\n      ")}),n.push("\n    </tr>\n    ")),n.push("\n  </thead>\n  <tbody>\n    "),tasks.forEach(function(t,a){n.push('\n    <tr>\n      <td class="fte-leaderEntry-cell-task">',escape(t.name),'\n      <td class="fte-leaderEntry-total-task">',round(t.total),"\n      "),t.companies.forEach(function(t,e){n.push("\n      "),Array.isArray(t.count)?(n.push("\n      "),t.count.forEach(function(t,o){n.push("\n      <td ",editable?"":'class="fte-leaderEntry-count"',">\n        "),editable?n.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="',t.value,'"\n          data-value="',t.value,'"\n          data-task="',a,'"\n          data-company="',e,'"\n          data-division="',o,'">\n        '):n.push("\n        ",round(t.value),"\n        "),n.push("\n      </td>\n      ")}),n.push("\n      ")):(n.push("\n      <td ",editable?"":'class="fte-leaderEntry-count"',' colspan="',divisions.length,'">\n        '),editable?n.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="',t.count,'"\n          data-value="',t.count,'"\n          data-task="',a,'"\n          data-company="',e,'">\n        '):n.push("\n        ",round(t.count),"\n        "),n.push("\n      </td>\n      ")),n.push("\n      ")}),n.push("\n    </tr>\n    ")}),n.push("\n  </tbody>\n</table>\n"),n.join("")}()+"\n    "),buf.push("\n  </div>\n</div>\n")}();return buf.join("")}});