define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="prodDowntimes-editForm" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',escape(formMethod),'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-master" class="control-label">',t("prodDowntimes","PROPERTY:master"),'</label>\n          <input id="',idPrefix,'-master" type="text" name="master" placeholder="',t("prodDowntimes","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-leader" class="control-label">',t("prodDowntimes","PROPERTY:leader"),'</label>\n          <input id="',idPrefix,'-leader" type="text" name="leader" placeholder="',t("prodDowntimes","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-operator" class="control-label">',t("prodDowntimes","PROPERTY:operator"),'</label>\n          <input id="',idPrefix,'-operator" type="text" name="operator" placeholder="',t("prodDowntimes","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n      </div>\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-reason" class="control-label">',t("prodDowntimes","PROPERTY:reason"),'</label>\n          <input id="',idPrefix,'-reason" type="text" name="reason">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-aor" class="control-label">',t("prodDowntimes","PROPERTY:aor"),'</label>\n          <input id="',idPrefix,'-aor" type="text" name="aor">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-reasonComment" class="control-label">',t("prodDowntimes","PROPERTY:reasonComment"),'</label>\n        <textarea id="',idPrefix,'-reasonComment" class="form-control" name="reasonComment" rows="3"></textarea>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-startedAtDate" class="control-label">',t("prodDowntimes","PROPERTY:startedAt"),'</label>\n        <div class=" form-group-datetime">\n          <input id="',idPrefix,'-startedAtDate" class="form-control" name="startedAtDate" type="date" required>\n          <input id="',idPrefix,'-startedAtTime" class="form-control" name="startedAtTime" type="time" required step="1">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-finishedAtDate" class="control-label">',t("prodDowntimes","PROPERTY:finishedAt"),'</label>\n        <div class=" form-group-datetime">\n          <input id="',idPrefix,'-finishedAtDate" class="form-control" name="finishedAtDate" type="date" required>\n          <input id="',idPrefix,'-finishedAtTime" class="form-control" name="finishedAtTime" type="time" required step="1">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-status" class="control-label">',t("prodDowntimes","PROPERTY:status"),'</label>\n        <div class="radio">\n          <label><input type="radio" name="status" value="undecided"> ',t("prodDowntimes","PROPERTY:status:undecided"),'</label>\n        </div>\n        <div class="radio">\n          <label><input type="radio" name="status" value="confirmed"> ',t("prodDowntimes","PROPERTY:status:confirmed"),'</label>\n        </div>\n        <div class="radio">\n          <label><input type="radio" name="status" value="rejected"> ',t("prodDowntimes","PROPERTY:status:rejected"),'</label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-decisionComment" class="control-label">',t("prodDowntimes","PROPERTY:decisionComment"),'</label>\n        <textarea id="',idPrefix,'-decisionComment" class="form-control" name="decisionComment" rows="3"></textarea>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});