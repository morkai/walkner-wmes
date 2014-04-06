define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(s){return String(s).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="panel panel-primary prodDowntimes-details">\n    <div class="panel-heading">\n      ',t("prodDowntimes","PANEL:TITLE:details"),'\n    </div>\n    <div class="panel-details row">\n      <div class="col-md-6">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:prodLine"),'</div>\n            <div class="prop-value">',model.prodLinePath||model.prodLine,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:pressWorksheet"),'</div>\n            <div class="prop-value">\n              '),model.pressWorksheet?(buf.push("\n              "),user.isAllowedTo("PRESS_WORKSHEETS:VIEW")?buf.push('\n              <a href="#pressWorksheets/',model.pressWorksheet,'">',t("core","BOOL:true"),"</a>\n              "):buf.push("\n              ",t("core","BOOL:true"),"\n              "),buf.push("\n              ")):buf.push("\n              -\n              "),buf.push('\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:shift"),'</div>\n            <div class="prop-value">',model.prodShiftText,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:order"),'</div>\n            <div class="prop-value">',model.order,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:master"),'</div>\n            <div class="prop-value">',model.masterInfo,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:leader"),'</div>\n            <div class="prop-value">',model.leaderInfo,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:operator"),'</div>\n            <div class="prop-value">',model.operatorInfo,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:creator"),'</div>\n            <div class="prop-value">',model.creatorInfo,'</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-6">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:startedAt"),'</div>\n            <div class="prop-value">',model.startedAt,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:finishedAt"),'</div>\n            <div class="prop-value">',model.finishedAt,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:duration"),'</div>\n            <div class="prop-value">',model.duration,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:aor"),'</div>\n            <div class="prop-value">',escape(model.aor||"-"),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:reason"),'</div>\n            <div class="prop-value">',escape(model.reason),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:reasonComment"),'</div>\n            <div class="prop-value">\n              '),model.reasonComment.length?buf.push('\n              <p class="prodDowntimes-comment">',escape(model.reasonComment),"</p>\n              "):buf.push("\n              -\n              "),buf.push('\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-',model.statusClassName,' prodDowntimes-details">\n    <div class="panel-heading">\n      ',t("prodDowntimes","PANEL:TITLE:details:corroboration"),"\n    </div>\n    "),"undecided"===model.status?buf.push('\n    <div class="panel-body">\n      <p>',t("prodDowntimes","NO_DATA:corroboration"),"</p>\n    </div>\n    "):(buf.push('\n    <div class="panel-details row">\n      <div class="col-md-6">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:status"),'</div>\n            <div class="prop-value">',t("prodDowntimes","PROPERTY:status:"+model.status),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:corroborator"),'</div>\n            <div class="prop-value">',model.corroboratorInfo,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:corroboratedAt"),'</div>\n            <div class="prop-value">',model.corroboratedAt,'</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-6">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">',t("prodDowntimes","PROPERTY:decisionComment"),'</div>\n            <div class="prop-value">\n              '),model.decisionComment&&model.decisionComment.length?buf.push('\n              <p class="prodDowntimes-comment">',escape(model.decisionComment),"</p>\n              "):buf.push("\n              -\n              "),buf.push("\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    ")),buf.push("\n  </div>\n</div>\n")}();return buf.join("")}});