define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="downtimeReasons-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="',idPrefix,'-id" class="control-label">',t("downtimeReasons","PROPERTY:_id"),'</label>\n        <input id="',idPrefix,'-id" class="form-control" type="text" name="_id" autofocus required maxlength="50" pattern="^[a-zA-Z][a-zA-Z_-]*$">\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-label" class="control-label">',t("downtimeReasons","PROPERTY:label"),'</label>\n        <input id="',idPrefix,'-label" class="form-control" type="text" name="label" required maxlength="100">\n      </div>\n      <div class="row">\n        <div class="col-md-2 form-group">\n          <label for="',idPrefix,'-type-maintenance" class="control-label">',t("downtimeReasons","PROPERTY:type"),"</label>\n          "),["maintenance","renovation","malfunction","adjusting","break","otherWorks","other"].forEach(function(e){buf.push('\n          <div class="radio">\n            <label>\n              <input id="',idPrefix,"-type-",e,'" type="radio" name="type" value="',e,'">\n              ',t("downtimeReasons","type:"+e),"\n            </label>\n          </div>\n          ")}),buf.push('\n        </div>\n        <div class="col-md-2 form-group">\n          <label for="',idPrefix,'-subdivisions-assembly" class="control-label">',t("downtimeReasons","PROPERTY:subdivisionTypes"),'</label>\n          <div class="checkbox">\n            <label>\n              <input id="',idPrefix,'-subdivisions-assembly" type="checkbox" name="subdivisionTypes[]" value="assembly">\n              ',t("downtimeReasons","subdivisionType:assembly"),'\n            </label>\n          </div>\n          <div class="checkbox">\n            <label>\n              <input type="checkbox" name="subdivisionTypes[]" value="press">\n              ',t("downtimeReasons","subdivisionType:press"),'\n            </label>\n          </div>\n        </div>\n        <div class="col-md-2 form-group">\n          <label for="',idPrefix,'-scheduled-true" class="control-label">',t("downtimeReasons","PROPERTY:scheduled"),"</label>\n          "),["true","false","null"].forEach(function(e){buf.push('\n          <div class="radio">\n            <label>\n              <input id="',idPrefix,"-scheduled-",e,'" type="radio" name="scheduled" value="',e,'">\n              ',t("core","BOOL:"+e),"\n            </label>\n          </div>\n          ")}),buf.push('\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="',idPrefix,'-aors" class="control-label">',t("downtimeReasons","PROPERTY:aors"),'</label>\n        <input id="',idPrefix,'-aors" type="text" name="aors">\n      </div>\n      <div class="row">\n        <div class="col-md-2 form-group">\n          <label for="',idPrefix,'-opticsPosition" class="control-label">',t("downtimeReasons","PROPERTY:opticsPosition"),'</label>\n          <input id="',idPrefix,'-opticsPosition" class="form-control" type="number" name="opticsPosition">\n        </div>\n        <div class="col-md-2 form-group">\n          <label for="',idPrefix,'-pressPosition" class="control-label">',t("downtimeReasons","PROPERTY:pressPosition"),'</label>\n          <input id="',idPrefix,'-pressPosition" class="form-control" type="number" name="pressPosition">\n        </div>\n      </div>\n      ',renderColorPicker({idPrefix:idPrefix,property:"color",label:t("downtimeReasons","PROPERTY:color"),value:model.color}),'\n      <div class="form-group-horizontal">\n        ',renderColorPicker({idPrefix:idPrefix,property:"refColor",label:t("downtimeReasons","PROPERTY:refColor"),value:model.refColor}),'\n        <div class="form-group">\n          <label for="',idPrefix,'-refValue" class="control-label">',t("downtimeReasons","PROPERTY:refValue"),'</label>\n          <input id="',idPrefix,'-refValue" class="form-control small" type="number" name="refValue" step="0.01">\n        </div>\n      </div>\n      <div class="checkbox">\n        <label>\n          <input id="',idPrefix,'-auto" type="checkbox" name="auto" value="true">\n          ',t("downtimeReasons","PROPERTY:auto"),'\n        </label>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});