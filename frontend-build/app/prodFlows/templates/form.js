define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="prodFlows-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="orgUnitDropdowns-container"></div>\n      <div class="form-group">\n        <label for="',idPrefix,'-name" class="control-label">',t("prodFlows","PROPERTY:name"),'</label>\n        <input id="',idPrefix,'-name" class="form-control" type="text" name="name" required maxlength="150">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-deactivatedAt" class="control-label">',t("prodFlows","PROPERTY:deactivatedAt"),'</label>\n        <input id="',idPrefix,'-deactivatedAt" class="form-control" type="date" name="deactivatedAt" maxlength="10">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});