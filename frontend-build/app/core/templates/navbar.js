define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(a){return String(a).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="navbar-inner">\n  <div class="navbar-header">\n    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">\n      <span class="sr-only">',t("core","NAVBAR:TOGGLE"),'</span>\n      <span class="icon-bar"></span>\n      <span class="icon-bar"></span>\n      <span class="icon-bar"></span>\n    </button>\n    <a class="navbar-brand fa fa-cogs" href="#"></a>\n  </div>\n  <div class="collapse navbar-collapse navbar-ex1-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">',t("core","NAVBAR:DASHBOARD"),'</a>\n      <li data-online data-privilege="EVENTS:VIEW"><a href="#events">',t("core","NAVBAR:EVENTS"),'</a>\n      <li data-online data-privilege="FTE:*" class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          ',t("core","NAVBAR:FTE"),'\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="FTE:MASTER:*" class="dropdown-header">',t("core","NAVBAR:FTE:MASTER"),'\n          <li data-privilege="FTE:MASTER:VIEW"><a href="#fte/master">',t("core","NAVBAR:FTE:MASTER:LIST"),'</a>\n          <li data-privilege="FTE:MASTER:MANAGE"><a href="#fte/master/current">',t("core","NAVBAR:FTE:MASTER:CURRENT"),'</a>\n          <li data-privilege="FTE:MASTER:* FTE:LEADER:*" class="divider">\n          <li data-privilege="FTE:LEADER:*" class="dropdown-header">',t("core","NAVBAR:FTE:LEADER"),'\n          <li data-privilege="FTE:LEADER:VIEW"><a href="#fte/leader">',t("core","NAVBAR:FTE:LEADER:LIST"),'</a>\n          <li data-privilege="FTE:LEADER:MANAGE"><a href="#fte/leader/current">',t("core","NAVBAR:FTE:LEADER:CURRENT"),'</a>\n        </ul>\n      <li data-online data-privilege="HOURLY_PLANS:VIEW"><a href="#hourlyPlans">',t("core","NAVBAR:HOURLY_PLANS"),'</a>\n      <li data-online class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          ',t("core","NAVBAR:PROD"),'\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="PRESS_WORKSHEETS:VIEW"><a href="#pressWorksheets">',t("core","NAVBAR:PRESS_WORKSHEETS"),'</a>\n          <li data-privilege="PROD_DATA:VIEW"><a href="#prodLogEntries">',t("core","NAVBAR:PROD:LOG_ENTRIES"),'</a>\n          <li data-privilege="PROD_DATA:VIEW"><a href="#prodShifts">',t("core","NAVBAR:PROD:SHIFTS"),'</a>\n          <li data-privilege="PROD_DOWNTIMES:VIEW"><a href="#prodDowntimes">',t("core","NAVBAR:PROD:DOWNTIMES"),'</a>\n          <li data-privilege="PROD_DATA:VIEW"><a href="#prodShiftOrders">',t("core","NAVBAR:PROD:SHIFT_ORDERS"),'</a>\n        </ul>\n      <li data-online class="dropdown">\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          ',t("core","NAVBAR:DICTIONARIES"),'\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="ORDERS:VIEW"><a href="#mechOrders">',t("core","NAVBAR:MECH_ORDERS"),'</a>\n          <li data-privilege="ORDERS:VIEW"><a href="#orders">',t("core","NAVBAR:OTHER_ORDERS"),'</a>\n          <li data-privilege="ORDERS:VIEW"><a href="#emptyOrders">',t("core","NAVBAR:EMPTY_ORDERS"),'</a>\n          <li data-privilege="USERS:VIEW ORDERS:VIEW" class="divider">\n          <li data-privilege="USERS:VIEW"><a href="#users">',t("core","NAVBAR:USERS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW USERS:VIEW" class="divider">\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#divisions">',t("core","NAVBAR:DIVISIONS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#subdivisions">',t("core","NAVBAR:SUBDIVISIONS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#mrpControllers">',t("core","NAVBAR:MRP_CONTROLLERS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#prodFlows">',t("core","NAVBAR:PROD_FLOWS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#workCenters">',t("core","NAVBAR:WORK_CENTERS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#prodLines">',t("core","NAVBAR:PROD_LINES"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#aors">',t("core","NAVBAR:AORS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW" class="divider">\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#companies">',t("core","NAVBAR:COMPANIES"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#prodFunctions">',t("core","NAVBAR:PROD_FUNCTIONS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#prodTasks">',t("core","NAVBAR:PROD_TASKS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#orderStatuses">',t("core","NAVBAR:ORDER_STATUSES"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#downtimeReasons">',t("core","NAVBAR:DOWNTIME_REASONS"),'</a>\n          <li data-privilege="DICTIONARIES:VIEW"><a href="#lossReasons">',t("core","NAVBAR:LOSS_REASONS"),'</a>\n        </ul>\n      <li class="dropdown" data-online>\n        <a class="dropdown-toggle" data-toggle="dropdown">\n          ',t("core","NAVBAR:REPORTS"),'\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-privilege="REPORTS:VIEW"><a href="#reports/1">',t("core","NAVBAR:REPORTS:1"),'</a>\n          <li data-privilege="REPORTS:VIEW" class="divider">\n          <li><a href="#vis/structure">',t("core","NAVBAR:VIS:STRUCTURE"),'</a>\n        </ul>\n    </ul>\n    <ul class="nav navbar-nav navbar-right">\n      <li class="dropdown navbar-account-dropdown">\n        <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="fa fa-user fa-lg navbar-account-status"></i>\n          ',user.getLabel(),'\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-online><a href="#users/',user.data._id,'">',t("core","NAVBAR:MY_ACCOUNT"),'</a>\n          <li class="divider">\n          <li data-loggedin="false"><a class="navbar-account-logIn" href="#login">',t("core","NAVBAR:LOG_IN"),'</a>\n          <li data-loggedin><a class="navbar-account-logOut" href="/logout">',t("core","NAVBAR:LOG_OUT"),"</a>\n        </ul>\n      </li>\n    </ul>\n  </div>\n</div>\n")}();return buf.join("")}});