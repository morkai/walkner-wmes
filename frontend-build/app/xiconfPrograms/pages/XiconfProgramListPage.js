// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/FilteredListPage","../views/XiconfProgramListView","../views/XiconfProgramFilterView"],function(e,i,r,o){"use strict";return i.extend({FilterView:o,ListView:r,breadcrumbs:[e.bound("xiconfPrograms","BREADCRUMBS:base"),e.bound("xiconfPrograms","BREADCRUMBS:browse")]})});