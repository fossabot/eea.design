/* jslint:disable */
/*global jQuery, window, _, document, Element */
/*global PDFJS */

PDFJS.useOnlyCssZoom = true;
PDFJS.disableTextLayer = true;
PDFJS.maxImageSize = 1024 * 1024;
PDFJS.workerSrc = '/www/pdf.worker.min.js';


var DEFAULT_URL = './at_view/file';
// var DEFAULT_URL = window.location.href + '/at_view/file';
var DEFAULT_SCALE_DELTA = 1.1;
var MIN_SCALE = 0.25;
var MAX_SCALE = 10.0;
var DEFAULT_SCALE_VALUE = 'auto';


var PDFViewerApplication = {
  pdfLoadingTask: null,
  pdfDocument: null,
  pdfViewer: null,
  pdfHistory: null,
  pdfLinkService: null,

  /**
   * Opens PDF document specified by URL.
   * @returns {Promise} - Returns the promise, which is resolved when document
   *                      is opened.
   */
  open: function (params) {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document
      return this.close().then(function () {
        // ... and repeat the open() call.
        return this.open(params);
      }.bind(this));
    }

    var url = params.url;
    var self = this;

    // Loading document.
    var loadingTask = PDFJS.getDocument(url);
    this.pdfLoadingTask = loadingTask;

    loadingTask.onProgress = function (progressData) {
      self.progress(progressData.loaded / progressData.total);
    };

    return loadingTask.promise.then(function (pdfDocument) {
      // Document loaded, specifying document for the viewer.
      self.pdfDocument = pdfDocument;
      self.pdfViewer.setDocument(pdfDocument);
      self.pdfLinkService.setDocument(pdfDocument);
      self.pdfHistory.initialize(pdfDocument.fingerprint);

      self.loadingBar.hide();
    }, function (exception) {
      var message = exception && exception.message;
      var l10n = self.l10n;
      var loadingErrorMessage;

      if (exception instanceof PDFJS.InvalidPDFException) {
        // change error message also for other builds
        loadingErrorMessage = l10n.get('invalid_file_error', null,
          'Invalid or corrupted PDF file.');
      } else if (exception instanceof PDFJS.MissingPDFException) {
        // special message for missing PDFs
        loadingErrorMessage = l10n.get('missing_file_error', null,
          'Missing PDF file.');
      } else if (exception instanceof PDFJS.UnexpectedResponseException) {
        loadingErrorMessage = l10n.get('unexpected_response_error', null,
          'Unexpected server response.');
      } else {
        loadingErrorMessage = l10n.get('loading_error', null,
          'An error occurred while loading the PDF.');
      }

      loadingErrorMessage.then(function (msg) {
        self.error(msg, {message: message});
      });
      self.loadingBar.hide();
    });
  },

  /**
   * Closes opened PDF document.
   * @returns {Promise} - Returns the promise, which is resolved when all
   *                      destruction is completed.
   */
  close: function () {
    var errorWrapper = document.getElementById('errorWrapper');
    errorWrapper.setAttribute('hidden', 'true');

    if (!this.pdfLoadingTask) {
      return Promise.resolve();
    }

    var promise = this.pdfLoadingTask.destroy();
    this.pdfLoadingTask = null;

    if (this.pdfDocument) {
      this.pdfDocument = null;

      this.pdfViewer.setDocument(null);
      this.pdfLinkService.setDocument(null, null);
    }

    return promise;
  },

  get loadingBar() {
    var bar = new PDFJS.ProgressBar('#loadingBar', {});

    return PDFJS.shadow(this, 'loadingBar', bar);
  },

  error: function pdfViewError(message, moreInfo) {
    var l10n = this.l10n;
    var moreInfoText = [l10n.get('error_version_info',
      {version: PDFJS.version || '?', build: PDFJS.build || '?'},
      'PDF.js v{{version}} (build: {{build}})')];

    if (moreInfo) {
      moreInfoText.push(
        l10n.get('error_message', {message: moreInfo.message},
          'Message: {{message}}'));
      if (moreInfo.stack) {
        moreInfoText.push(
          l10n.get('error_stack', {stack: moreInfo.stack},
            'Stack: {{stack}}'));
      } else {
        if (moreInfo.filename) {
          moreInfoText.push(
            l10n.get('error_file', {file: moreInfo.filename},
              'File: {{file}}'));
        }
        if (moreInfo.lineNumber) {
          moreInfoText.push(
            l10n.get('error_line', {line: moreInfo.lineNumber},
              'Line: {{line}}'));
        }
      }
    }

    var errorWrapper = document.getElementById('errorWrapper');
    errorWrapper.removeAttribute('hidden');

    var errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;

    var closeButton = document.getElementById('errorClose');
    closeButton.onclick = function() {
      errorWrapper.setAttribute('hidden', 'true');
    };

    var errorMoreInfo = document.getElementById('errorMoreInfo');
    var moreInfoButton = document.getElementById('errorShowMore');
    var lessInfoButton = document.getElementById('errorShowLess');
    moreInfoButton.onclick = function() {
      errorMoreInfo.removeAttribute('hidden');
      moreInfoButton.setAttribute('hidden', 'true');
      lessInfoButton.removeAttribute('hidden');
      errorMoreInfo.style.height = errorMoreInfo.scrollHeight + 'px';
    };
    lessInfoButton.onclick = function() {
      errorMoreInfo.setAttribute('hidden', 'true');
      moreInfoButton.removeAttribute('hidden');
      lessInfoButton.setAttribute('hidden', 'true');
    };
    moreInfoButton.removeAttribute('hidden');
    lessInfoButton.setAttribute('hidden', 'true');
    Promise.all(moreInfoText).then(function (parts) {
      errorMoreInfo.value = parts.join('\n');
    });
  },

  progress: function pdfViewProgress(level) {
    var percent = Math.round(level * 100);
    // Updating the bar if value increases.
    if (percent > this.loadingBar.percent || isNaN(percent)) {
      this.loadingBar.percent = percent;
    }
  },

  get pagesCount() {
    return this.pdfDocument.numPages;
  },

  set page(val) {
    this.pdfViewer.currentPageNumber = val;
  },

  get page() {
    return this.pdfViewer.currentPageNumber;
  },

  zoomIn: function pdfViewZoomIn(ticks) {
    var newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks && newScale < MAX_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  },

  zoomOut: function pdfViewZoomOut(ticks) {
    var newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks && newScale > MIN_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  },
  
  fullscreen: function pdfViewFullscreen() {
    
  },

  initUI: function pdfViewInitUI() {
    var linkService = new PDFJS.PDFLinkService();
    this.pdfLinkService = linkService;

    this.l10n = PDFJS.NullL10n;

    var container = document.getElementById('viewerContainer');
    var pdfViewer = new PDFJS.PDFViewer({
      container: container,
      linkService: linkService,
      l10n: this.l10n,
    });
    this.pdfViewer = pdfViewer;
    linkService.setViewer(pdfViewer);

    this.pdfHistory = new PDFJS.PDFHistory({
      linkService: linkService
    });
    linkService.setHistory(this.pdfHistory);

    document.getElementById('previous').addEventListener('click', function() {
      PDFViewerApplication.page--;
    });

    document.getElementById('next').addEventListener('click', function() {
      PDFViewerApplication.page++;
    });

    document.getElementById('zoomIn').addEventListener('click', function() {
      PDFViewerApplication.zoomIn();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
      PDFViewerApplication.zoomOut();
    });

    document.getElementById('secondaryPresentationMode').addEventListener('click', function() {
      PDFViewerApplication.fullscreen();
    });

    document.getElementById('pageNumber').addEventListener('click', function() {
      this.select();
    });

    document.getElementById('pageNumber').addEventListener('change',
        function() {
      PDFViewerApplication.page = (this.value | 0);

      // Ensure that the page number input displays the correct value, even if the
      // value entered by the user was invalid (e.g. a floating point number).
      if (this.value !== PDFViewerApplication.page.toString()) {
        this.value = PDFViewerApplication.page;
      }
    });

    container.addEventListener('pagesinit', function () {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
    });

    container.addEventListener('pagechange', function (evt) {
      var page = evt.pageNumber;
      var numPages = PDFViewerApplication.pagesCount;

      document.getElementById('pageNumber').value = page;
      document.getElementById('previous').disabled = (page <= 1);
      document.getElementById('next').disabled = (page >= numPages);
    }, true);
  }
};


function toggleFullScreen() {
	if (!document.fullscreenElement &&
		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
  		if (document.documentElement.requestFullscreen) {
  			document.documentElement.requestFullscreen();
  		} else if (document.documentElement.msRequestFullscreen) {
  			document.documentElement.msRequestFullscreen();
  		} else if (document.documentElement.mozRequestFullScreen) {
  			document.documentElement.mozRequestFullScreen();
  		} else if (document.documentElement.webkitRequestFullscreen) {
  			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  		}
  	} else {
  		if (document.exitFullscreen) {
  			document.exitFullscreen();
  		} else if (document.msExitFullscreen) {
  			document.msExitFullscreen();
  		} else if (document.mozCancelFullScreen) {
  			document.mozCancelFullScreen();
  		} else if (document.webkitExitFullscreen) {
  			document.webkitExitFullscreen();
  		}
  	}
}

jQuery(document).ready(function($) {
  PDFViewerApplication.initUI();

  (function animationStartedClosure() {
    // The offsetParent is not set until the PDF.js iframe or object is visible.
    // Waiting for first animation.
    PDFViewerApplication.animationStartedPromise = new Promise(
      function (resolve) {
        window.requestAnimationFrame(resolve);
      });
  })();
  
  // We need to delay opening until all HTML is loaded.
  PDFViewerApplication.animationStartedPromise.then(function () {
    PDFViewerApplication.open({
      url: DEFAULT_URL
    });
  });
});
