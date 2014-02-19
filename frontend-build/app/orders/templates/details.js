define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(s){return String(s).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-',panelType,' orders-details">\n  <div class="panel-heading">',panelTitle,'</div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:_id"),'</div>\n          <div class="prop-value">',escape(model._id),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:nc12"),'</div>\n          <div class="prop-value">',escape(model.nc12||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:name"),'</div>\n          <div class="prop-value">',escape(model.name||"-"),'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:mrp"),'</div>\n          <div class="prop-value">',escape(model.mrp||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:qty"),'</div>\n          <div class="prop-value">',escape(model.qtyUnit||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:statuses"),'</div>\n          <div class="prop-value">',model.statusLabels,'</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:startDate"),'</div>\n          <div class="prop-value">',escape(model.startDateText||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:finishDate"),'</div>\n          <div class="prop-value">',escape(model.finishDateText||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:createdAt"),'</div>\n          <div class="prop-value">',escape(model.createdAtText||"-"),"</div>\n        </div>\n        "),model.updatedAtText&&buf.push('\n        <div class="prop">\n          <div class="prop-name">',t("orders","PROPERTY:updatedAt"),'</div>\n          <div class="prop-value">',escape(model.updatedAtText),"</div>\n        </div>\n        "),buf.push("\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});