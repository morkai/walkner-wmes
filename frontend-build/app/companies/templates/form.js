define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="companies-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="',idPrefix,'-id" class="control-label">',t("companies","PROPERTY:_id"),'</label>\n        <input id="',idPrefix,'-id" class="form-control" type="text" name="_id" autofocus required maxlength="50" pattern="^[a-zA-Z][a-zA-Z0-9_-]*$">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-name" class="control-label">',t("companies","PROPERTY:name"),'</label>\n        <input id="',idPrefix,'-name" class="form-control" type="text" name="name" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-fteMasterPosition" class="control-label">',t("companies","PROPERTY:fteMasterPosition"),'</label>\n        <input id="',idPrefix,'-fteMasterPosition" class="form-control small" type="number" name="fteMasterPosition" min="-1">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-fteLeaderPosition" class="control-label">',t("companies","PROPERTY:fteLeaderPosition"),'</label>\n        <input id="',idPrefix,'-fteLeaderPosition" class="form-control small" type="number" name="fteLeaderPosition" min="-1">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});