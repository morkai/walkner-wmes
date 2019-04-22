define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<div>\n  "),function(){__append('<div id="'),__append(idPrefix),__append('-props" class="panel panel-'),__append(model.statusClassName),__append(' prodDowntimes-details">\n  <div class="panel-heading">'),__append(t("core","PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"!pressWorksheet",visible:!!model.productName,value:function(e){return e?user.isAllowedTo("PRESS_WORKSHEETS:VIEW")?'<a href="#pressWorksheets/'+model.pressWorksheet+'">'+t("core","BOOL:true")+"</a>":t("core","BOOL:true"):t("core","BOOL:false")}},{id:"!shift",value:model.prodShiftText},{id:"!order",visible:!!model.productName,value:function(){return user.isAllowedTo("PROD_DATA:VIEW")?'<a href="#prodShiftOrders/'+model.prodShiftOrder._id+'">'+model.orderId+"</a>: "+_.escape(model.productName):model.orderId+": "+_.escape(model.productName)}},{id:"operation",visible:!!model.productName,value:model.operationNo+(model.operationName?": "+model.operationName:"")},{id:"!order",visible:!model.productName},{id:"!master",value:model.masterInfo},{id:"!leader",value:model.leaderInfo},{id:"!operator",value:model.operatorInfo}])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"status",value:model.statusText},"reason","aor","startedAt","!finishedAt","duration"])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,["division","subdivision",{id:"!mrpControllers",value:function(e){var n=_.escape(e);return model.orderMrp&&(n+=" "+helpers.t("details:orderMrp",{mrp:model.orderMrp})),n}},"prodFlow","workCenter","prodLine"])),__append("\n    </div>\n  </div>\n</div>\n")}.call(this),__append('\n  <div id="'),__append(idPrefix),__append('-history" class="panel panel-default prodDowntimes-history">\n    <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:history")),__append("</div>\n    "),model.history.forEach(function(e,n){__append("\n    "),function(){__append('<div class="prodDowntimes-history-item">\n  <span class="prodDowntimes-history-user">'),__append(e.user),__append('</span>,\n  <time class="prodDowntimes-history-time" datetime="'),__append(e.time.iso),__append('" title="'),__append(e.time.long),__append('">'),__append(e.time.daysAgo>5?e.time.long:e.time.human),__append("</time>:\n  "),e.changes.length&&(__append('\n  <table class="table table-condensed prodDowntimes-history-changes">\n    <tbody>\n      '),e.changes.forEach(function(e){__append('\n      <tr>\n        <td class="is-min">'),__append(e.label),__append(n?":":""),__append("</td>\n        "),n&&(__append('\n        <td class="is-min">'),__append(e.oldValue),__append("</td>\n        ")),__append('\n        <td class="is-min"><i class="fa fa-arrow-right"></i></td>\n        <td class="is-min">'),__append(e.newValue),__append("</td>\n        <td></td>\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n  ")),__append("\n  "),""!==e.comment&&(__append('\n  <p class="prodDowntimes-history-comment">'),__append(escapeFn(e.comment)),__append("</p>\n  ")),__append("\n</div>")}.call(this),__append("\n    ")}),__append("\n    "),!model.pressWorksheet&&user.isLoggedIn()&&(__append("\n    "),function(){__append('<form id="'),__append(idPrefix),__append('-corroborate" class="prodDowntimes-corroborate" method="post">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("prodDowntimes","corroborate:comment")),__append('</label>\n    <textarea id="'),__append(idPrefix),__append('-comment" class="form-control prodDowntimes-corroborate-comment" name="comment" rows="3"></textarea>\n  </div>\n  <button type="submit" class="btn btn-primary"></button>\n</form>\n')}.call(this),__append("\n    ")),__append("\n  </div>\n</div>\n");return __output.join("")}});