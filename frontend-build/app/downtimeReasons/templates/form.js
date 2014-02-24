define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="downtimeReasons-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="',idPrefix,'-id" class="control-label">',t("downtimeReasons","PROPERTY:_id"),'</label>\n        <input id="',idPrefix,'-id" class="form-control" type="text" name="_id" autofocus required maxlength="50" pattern="^[a-zA-Z][a-zA-Z_-]*$">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-label" class="control-label">',t("downtimeReasons","PROPERTY:label"),'</label>\n        <input id="',idPrefix,'-label" class="form-control" type="text" name="label" required maxlength="100">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-type-malfunction" class="control-label">',t("downtimeReasons","PROPERTY:type"),'</label>\n        <div class="radio">\n          <label>\n            <input id="',idPrefix,'-type-maintenance" type="radio" name="type" value="maintenance">\n            ',t("downtimeReasons","type:maintenance"),'\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" name="type" value="renovation">\n            ',t("downtimeReasons","type:renovation"),'\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" name="type" value="malfunction">\n            ',t("downtimeReasons","type:malfunction"),'\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" name="type" value="break">\n            ',t("downtimeReasons","type:break"),'\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" name="type" value="other">\n            ',t("downtimeReasons","type:other"),'\n          </label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-subdivisions-assembly" class="control-label">',t("downtimeReasons","PROPERTY:subdivisionTypes"),'</label>\n        <div class="checkbox">\n          <label>\n            <input id="',idPrefix,'-subdivisions-assembly" type="checkbox" name="subdivisionTypes[]" value="assembly">\n            ',t("downtimeReasons","subdivisionType:assembly"),'\n          </label>\n        </div>\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="subdivisionTypes[]" value="press">\n            ',t("downtimeReasons","subdivisionType:press"),'\n          </label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-opticsPosition" class="control-label">',t("downtimeReasons","PROPERTY:opticsPosition"),'</label>\n        <input id="',idPrefix,'-opticsPosition" class="form-control" type="number" name="opticsPosition">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-pressPosition" class="control-label">',t("downtimeReasons","PROPERTY:pressPosition"),'</label>\n        <input id="',idPrefix,'-pressPosition" class="form-control" type="number" name="pressPosition">\n      </div>\n      <div class="form-group">\n        <label class="control-label checkbox">\n          <input id="',idPrefix,'-auto" type="checkbox" name="auto" value="true">\n          ',t("downtimeReasons","PROPERTY:auto"),'\n        </label>\n      </div>\n      <div class="form-group">\n        <label class="control-label checkbox">\n          <input id="',idPrefix,'-scheduled" type="checkbox" name="scheduled" value="true">\n          ',t("downtimeReasons","PROPERTY:scheduled"),'\n        </label>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});