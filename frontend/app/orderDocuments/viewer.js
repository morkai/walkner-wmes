/*global Viewer,PAGE_COUNT */
/*jshint -W097,-W101*/

'use strict';

var PAGE_NUMBERS = 4;
var PAGE_DOTS_VISIBLE = false;
var PAGE_FIRST_LAST_VISIBLE = false;
var PAGE_NEXT_PREV_VISIBLE = false;

Viewer.TEMPLATE =
  '<div class="viewer-container">' +
  '<div class="viewer-canvas"></div>' +
  '<div class="viewer-footer">' +
  '<div class="viewer-title"></div>' +
  '<ul class="viewer-toolbar">' +
  '<li id="pdf" title="Pokaż oryginalny plik PDF"><span class="fa fa-file-pdf-o"></span></li>' +
  '<li class="viewer-zoom-in" data-action="zoom-in" title="Powiększ"><span class="fa fa-plus" data-action="zoom-in"></span></li>' +
  '<li class="viewer-zoom-out" data-action="zoom-out" title="Pomniejsz"><span class="fa fa-minus" data-action="zoom-out"></span></li>' +
  '<li class="viewer-one-to-one" data-action="one-to-one" title="Dopasuj do strony">1:1</li>' +
  '<li class="viewer-reset" data-action="reset" title="Resetuj widok">0</li>' +
  '<li class="viewer-rotate-right" data-action="rotate-right" title="Obróć w prawo"><span class="fa fa-rotate-right" data-action="rotate-right"></span></li>' +
  '<li class="viewer-flip-horizontal" data-action="flip-horizontal" title="Odwróć poziomo"><span class="fa fa-arrows-h" data-action="flip-horizontal"></span></li>' +
  '<li class="viewer-flip-vertical" data-action="flip-vertical" title="Odwróć pionowo"><span class="fa fa-arrows-v" data-action="flip-vertical"></span></li>';

  if (PAGE_COUNT > 1)
  {
    if (PAGE_COUNT > 9)
    {
      Viewer.TEMPLATE += '<li id="first" title="Pierwsza strona">1</li>';
    }

    Viewer.TEMPLATE +=
      '<li class="viewer-prev" data-action="prev" title="Poprzednia strona"><span class="fa fa-chevron-left" data-action="prev"></span></li>' +
      '<li class="viewer-next" data-action="next" title="Następna strona"><span class="fa fa-chevron-right" data-action="next"></span></li>';

    if (PAGE_COUNT > 9)
    {
      Viewer.TEMPLATE += '<li id="jump" title="Skocz do strony">...</li>';
    }
  }

  Viewer.TEMPLATE +=
    '</ul>' +
    '<div class="viewer-navbar">' +
    '<ul class="viewer-list"></ul>' +
    '</div>' +
    '</div>' +
    '<div class="viewer-tooltip"></div>' +
    '<div class="viewer-button" data-action="mix"></div>' +
    '<div class="viewer-player"></div>' +
    '</div>';

var viewer = new Viewer(document.getElementById('images'), {
  button: false,
  keyboard: false,
  navbar: false,
  title: false,
  tooltip: false,
  view: function(e)
  {
    document.getElementById('jumpForm').classList.add('hidden');

    renderPages(e.detail.index);
  }
});

window.onload = function()
{
  viewer.show();

  var firstEl = document.getElementById('first');
  var jumpEl = document.getElementById('jump');
  var jumpFormEl = document.getElementById('jumpForm');
  var pagesEl = document.getElementById('pages');

  document.getElementById('pdf').addEventListener('click', function()
  {
    var href = window.location.href;

    window.location.href = href + (href.indexOf('?') === -1 ? '?' : '&') + 'pdf=1';
  });

  if (firstEl)
  {
    firstEl.addEventListener('click', function()
    {
      viewer.view(0);
    });
  }

  if (jumpEl)
  {
    jumpEl.addEventListener('click', function()
    {
      document.getElementById('pageNo').value = (viewer.index + 1) + ' / ' + PAGE_COUNT;
      document.getElementById('pageNo').dataset.value = '';
      document.getElementById('jumpForm').classList.toggle('hidden');
    });
  }

  if (pagesEl)
  {
    pagesEl.addEventListener('click', function(e)
    {
      if (e.target.dataset.page)
      {
        viewer.view(+e.target.dataset.page - 1);
      }
    });
  }

  if (jumpFormEl)
  {
    jumpFormEl.addEventListener('click', function (e)
    {
      var key = e.target.dataset.key;

      if (!key)
      {
        return;
      }

      var pageNoEl = document.getElementById('pageNo');

      if (key === 'BACKSPACE')
      {
        pageNoEl.value = '? / ' + PAGE_COUNT;
        pageNoEl.dataset.value = '';
      }
      else
      {
        pageNoEl.dataset.value += key;
        pageNoEl.value = pageNoEl.dataset.value + ' / ' + PAGE_COUNT;
      }
    });

    jumpFormEl.addEventListener('submit', function (e)
    {
      e.preventDefault();

      e.target.classList.add('hidden');

      var pageNoEl = document.getElementById('pageNo');
      var pageNo = parseInt(pageNoEl.value, 10);

      if (isNaN(pageNo))
      {
        return;
      }

      if (pageNo < 1)
      {
        pageNo = 1;
      }
      else if (pageNo > PAGE_COUNT)
      {
        pageNo = PAGE_COUNT;
      }

      viewer.view(pageNo - 1);
    });
  }
};

function renderPages(currentPage)
{
  if (PAGE_COUNT === 1)
  {
    return;
  }

  var pageData = serializePages(currentPage + 1);
  var pagesEl = document.getElementById('pages');
  var html = '';

  pageData.pages.forEach(function(page)
  {
    html += '<li data-page="' + page.no + '" class="' + (page.active ? 'is-active' : '') + '">' + page.no + '</li>';
  });

  pagesEl.innerHTML = html;
}

function serializePages(currentPage)
{
  var pageCount = PAGE_COUNT;
  var pageNrs = PAGE_NUMBERS;

  if (PAGE_DOTS_VISIBLE)
  {
    pageNrs += 1;
  }

  var firstPageNr = currentPage;
  var lastPageNr = firstPageNr + pageNrs;
  var cut = true;
  var leftDotsVisible = false;

  if ((firstPageNr - pageNrs) < 1)
  {
    firstPageNr = 1;
  }
  else
  {
    firstPageNr -= pageNrs;
    leftDotsVisible = PAGE_DOTS_VISIBLE && firstPageNr !== 1;
  }

  if (leftDotsVisible)
  {
    firstPageNr += 1;
  }

  if (lastPageNr > pageCount)
  {
    lastPageNr = pageCount;
    cut = false;
  }

  if (currentPage < (pageNrs + 1))
  {
    lastPageNr += (pageNrs + 1) - currentPage;

    if (lastPageNr > pageCount)
    {
      lastPageNr = pageCount;
    }
  }
  else if (currentPage > (pageCount - pageNrs))
  {
    firstPageNr -= pageNrs - (pageCount - currentPage);

    if (firstPageNr < 1)
    {
      firstPageNr = 1;
    }
  }

  var rightDotsVisible = PAGE_DOTS_VISIBLE
    && cut
    && lastPageNr !== pageCount;

  if (rightDotsVisible)
  {
    lastPageNr -= 1;
  }

  if (firstPageNr === 1)
  {
    leftDotsVisible = false;
  }

  return {
    pageCount: pageCount,
    page: currentPage,
    visible: pageCount > 1,
    firstLastLinksVisible: PAGE_FIRST_LAST_VISIBLE,
    prevNextLinksVisible: PAGE_NEXT_PREV_VISIBLE,
    leftDotsVisible: leftDotsVisible,
    rightDotsVisible: rightDotsVisible,
    firstPageLinkAvailable: currentPage > 1,
    lastPageLinkAvailable: currentPage < pageCount,
    prevPageLinkAvailable: currentPage > 1,
    nextPageLinkAvailable: currentPage < pageCount,
    pages: generatePages(firstPageNr, lastPageNr, currentPage)
  };
}

function generatePages(firstPageNr, lastPageNr, currentPage)
{
  var pages = [];

  for (var page = firstPageNr; page <= lastPageNr; ++page)
  {
    pages.push({
      no: page,
      active: page === currentPage
    });
  }

  return pages;
}
