define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="vendors-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="',idPrefix,'-_id" class="control-label">',t("vendors","PROPERTY:_id"),'</label>\n        <input id="',idPrefix,'-_id" class="form-control" type="text" name="_id" required maxlength="50" pattern="^[a-zA-Z0-9_-]*$">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-name" class="control-label">',t("vendors","PROPERTY:name"),'</label>\n        <input id="',idPrefix,'-name" class="form-control" type="text" name="name" required maxlength="150">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});