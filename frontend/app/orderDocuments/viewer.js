/* globals Viewer, PAGE_COUNT, NC15 */
/* eslint-disable strict, operator-linebreak */

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
  '<li id="bomToggle" title="Pokaż komponenty">BOM</li>' +
  '<li id="lockUi" title="Zablokuj interfejs"><span class="fa fa-lock"></span></li>' +
  '<li id="pdf" title="Pokaż oryginalny plik PDF"><span class="fa fa-file-pdf-o"></span></li>' +
  '<li class="viewer-zoom-in" data-viewer-action="zoom-in" title="Powiększ"><span class="fa fa-plus"></span></li>' +
  '<li class="viewer-zoom-out" data-viewer-action="zoom-out" title="Pomniejsz"><span class="fa fa-minus"></span></li>' +
  '<li class="viewer-one-to-one" data-viewer-action="one-to-one" title="Dopasuj do strony">1:1</li>' +
  '<li class="viewer-reset" data-viewer-action="reset" title="Resetuj widok">0</li>' +
  '<li class="viewer-rotate-right" data-viewer-action="rotate-right" title="Obróć w prawo"><span class="fa fa-rotate-right"></span></li>' +
  '<li class="viewer-flip-horizontal" data-viewer-action="flip-horizontal" title="Odwróć poziomo"><span class="fa fa-arrows-h"></span></li>' +
  '<li class="viewer-flip-vertical" data-viewer-action="flip-vertical" title="Odwróć pionowo"><span class="fa fa-arrows-v"></span></li>';

  if (PAGE_COUNT > 1)
  {
    if (PAGE_COUNT > 9)
    {
      Viewer.TEMPLATE += '<li id="first" title="Pierwsza strona">1</li>';
    }

    Viewer.TEMPLATE +=
      '<li class="viewer-prev" data-viewer-action="prev" title="Poprzednia strona"><span class="fa fa-chevron-left"></span></li>' +
      '<li class="viewer-next" data-viewer-action="next" title="Następna strona"><span class="fa fa-chevron-right"></span></li>';

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

var adjustMarksTimer = null;
var adjustViewportAfterMarks = false;
var viewer = new Viewer(document.getElementById('images'), {
  button: false,
  keyboard: false,
  navbar: false,
  title: false,
  tooltip: false,
  backdrop: false,
  initialViewIndex: parseInt(sessionStorage.getItem('PAGE_' + (NC15 || '')), 10) || 0,
  toolbar: {},
  toggleOnDblclick: false,
  switchable: false,
  view: function(e)
  {
    document.getElementById('jumpForm').classList.add('hidden');

    if (NC15)
    {
      sessionStorage.setItem('PAGE_' + NC15, e.detail.index);
    }

    renderPages(e.detail.index);
  },
  rendering: function()
  {
    document.getElementById('marks').style.display = 'none';
  },
  rendered: function()
  {
    clearTimeout(adjustMarksTimer);
    adjustMarksTimer = setTimeout(adjustMarks, 300);

    window.ready = true;
  }
});

window.addEventListener('contextmenu', function(e)
{
  e.preventDefault();
});

window.addEventListener('touchstart', function(e)
{
  if (e.touches && e.touches.length > 1)
  {
    e.preventDefault();
  }
}, {passive: false});

window.addEventListener('load', function()
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

  var lockUiEl = document.getElementById('lockUi');

  if (window.parent.WMES_DOCS_LOCK_UI)
  {
    lockUiEl.addEventListener('click', function()
    {
      window.parent.WMES_DOCS_LOCK_UI(); // eslint-disable-line new-cap
    });
  }
  else
  {
    lockUiEl.style.display = 'none';
  }

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
    jumpFormEl.addEventListener('click', function(e)
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

    jumpFormEl.addEventListener('submit', function(e)
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

  var bomToggle = document.getElementById('bomToggle');

  if (window.parent.WMES_DOCS_BOM_TOGGLE)
  {
    bomToggle.addEventListener('click', function() { toggleBom(); });

    toggleBom(window.parent.WMES_DOCS_BOM_ACTIVE()); // eslint-disable-line new-cap
  }
  else
  {
    bomToggle.style.display = 'none';
  }
});

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

function showMarks(marks, page) // eslint-disable-line no-unused-vars
{
  var anyMarksOnCurrentPage = false;
  var currentPage = viewer.index + 1;

  document.getElementById('marks').innerHTML = marks.map(function(mark)
  {
    if (!anyMarksOnCurrentPage && mark.p === currentPage)
    {
      anyMarksOnCurrentPage = true;
    }

    return '<div class="mark" style="display: none" data-x="' + mark.x
      + '" data-y="' + mark.y
      + '" data-w="' + mark.w
      + '" data-h="' + mark.h
      + '" data-p="' + mark.p + '"></div>';
  }).join('\n');

  adjustViewportAfterMarks = true;

  if (page)
  {
    page -= 1;

    if (page === viewer.index)
    {
      adjustMarks();
    }
    else
    {
      viewer.view(page);
    }
  }
  else if (anyMarksOnCurrentPage)
  {
    adjustMarks();
  }
  else if (marks.length)
  {
    viewer.view(marks[0].p - 1);
  }
}

function adjustMarks()
{
  var marksEl = document.getElementById('marks');

  if (viewer.image)
  {
    marksEl.style.cssText = viewer.image.style.cssText;
  }

  var markEls = marksEl.querySelectorAll('.mark');

  for (var i = 0; i < markEls.length; ++i)
  {
    adjustMark(markEls[i]);
  }

  if (adjustViewportAfterMarks)
  {
    adjustViewportAfterMarks = false;

    adjustViewport();
  }
}

function adjustMark(markEl)
{
  var ratio = viewer.imageData.ratio;
  var width = markEl.dataset.w * 2 * ratio;
  var height = markEl.dataset.h * 2 * ratio;
  var top = (markEl.dataset.y * 2 * ratio) - height;
  var left = markEl.dataset.x * 2 * ratio;

  markEl.style.display = +markEl.dataset.p === (viewer.index + 1) ? '' : 'none';
  markEl.style.width = (width + 20 * ratio) + 'px';
  markEl.style.height = (height + 10 * ratio) + 'px';
  markEl.style.top = top + 'px';
  markEl.style.left = (left - 10 * ratio) + 'px';
}

function adjustViewport()
{
  var markEls = document.querySelectorAll('.mark');
  var visibleMarkCount = 0;
  var top = Number.MAX_VALUE;
  var bottom = 0;
  var left = Number.MAX_VALUE;
  var right = 0;

  for (var i = 0; i < markEls.length; ++i)
  {
    var markEl = markEls[i];

    if (markEl.style.display === 'none')
    {
      continue;
    }

    var rect = markEl.getBoundingClientRect();
    var visible = rect.top >= 0
      && rect.left >= 0
      && rect.bottom <= window.innerHeight
      && rect.right <= window.innerWidth;

    visibleMarkCount += visible ? 1 : 0;

    var markTop = parseInt(markEl.style.top, 10);
    var markLeft = parseInt(markEl.style.left, 10);

    top = Math.min(top, markTop);
    bottom = Math.max(bottom, markTop + rect.height);
    left = Math.min(left, markLeft);
    right = Math.max(right, markLeft + rect.width);
  }

  var ratio = viewer.imageData.ratio;

  if (viewer.imageData.ratio >= 0.4 && visibleMarkCount === markEls.length)
  {
    return;
  }

  top -= 20 * ratio;
  bottom += 20 * ratio;
  left -= 20 * ratio;
  right += 20 * ratio;

  top /= ratio;
  bottom /= ratio;
  left /= ratio;
  right /= ratio;

  var width = right - left;
  var height = bottom - top;
  var newRatio = Math.min(window.innerWidth / width, window.innerHeight / height, 1);
  var newLeft = left * newRatio;
  var newTop = top * newRatio;
  var newWidth = width * newRatio;
  var newHeight = height * newRatio;

  var x1 = 0;
  var y1 = 0;
  var w1 = window.innerWidth;
  var h1 = window.innerHeight;
  var w2 = newWidth;
  var h2 = newHeight;
  var x2 = x1 + ((w1 / 2) - (w2 / 2));
  var y2 = y1 + ((h1 / 2) - (h2 / 2));

  viewer.zoomTo(newRatio, false);
  viewer.moveTo(x2 - newLeft, y2 - newTop);
}

function toggleBom(newState)
{
  var bomToggle = document.getElementById('bomToggle');

  if (typeof newState === 'boolean')
  {
    bomToggle.classList.toggle('is-active', newState);

    return;
  }

  if (bomToggle.classList.contains('is-loading')
    || bomToggle.classList.contains('is-error'))
  {
    return;
  }

  bomToggle.classList.add('is-loading');

  bomToggle.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

  newState = !bomToggle.classList.contains('is-active');

  window.parent.WMES_DOCS_BOM_TOGGLE(newState, function(failure) // eslint-disable-line new-cap
  {
    if (failure)
    {
      bomToggle.classList.add('is-error');

      setTimeout(function() { bomToggle.classList.remove('is-error'); }, 3000);
    }

    bomToggle.classList.remove('is-loading');
    bomToggle.classList.toggle('is-active', window.parent.WMES_DOCS_BOM_ACTIVE()); // eslint-disable-line new-cap

    bomToggle.innerHTML = 'BOM';
  });
}
