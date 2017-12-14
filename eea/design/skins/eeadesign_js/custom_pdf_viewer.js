/* jslint:disable */
/*global jQuery, window, _, document, Element */
/*global PDFJS */

















// 1 TRY

// PDFJS.useOnlyCssZoom = true;
// PDFJS.disableTextLayer = true;
// PDFJS.maxImageSize = 1024 * 1024;
// PDFJS.workerSrc = '/www/pdf.worker.min.js';


// var DEFAULT_URL = './at_view/file';
// // var DEFAULT_URL = window.location.href + '/at_view/file';
// var DEFAULT_SCALE_DELTA = 1.1;
// var MIN_SCALE = 0.25;
// var MAX_SCALE = 10.0;
// var DEFAULT_SCALE_VALUE = 'auto';


// var PDFViewerApplication = {
//   pdfLoadingTask: null,
//   pdfDocument: null,
//   pdfViewer: null,
//   pdfHistory: null,
//   pdfLinkService: null,
//   /** @type {PDFRenderingQueue} */
//   pdfRenderingQueue: null,

//   /**
//   * Opens PDF document specified by URL.
//   * @returns {Promise} - Returns the promise, which is resolved when document
//   *                      is opened.
//   */
//   open: function (params) {
//     if (this.pdfLoadingTask) {
//       // We need to destroy already opened document
//       return this.close().then(function () {
//         // ... and repeat the open() call.
//         return this.open(params);
//       }.bind(this));
//     }

//     var url = params.url;
//     var self = this;

//     // Loading document.
//     var loadingTask = PDFJS.getDocument(url);
//     this.pdfLoadingTask = loadingTask;

//     loadingTask.onProgress = function (progressData) {
//       self.progress(progressData.loaded / progressData.total);
//     };

//     return loadingTask.promise.then(function (pdfDocument) {
//       // Document loaded, specifying document for the viewer.
//       self.pdfDocument = pdfDocument;
//       self.pdfViewer.setDocument(pdfDocument);
//       self.pdfLinkService.setDocument(pdfDocument);
//       self.pdfHistory.initialize(pdfDocument.fingerprint);

//       self.loadingBar.hide();
//     }, function (exception) {
//       var message = exception && exception.message;
//       var l10n = self.l10n;
//       var loadingErrorMessage;

//       if (exception instanceof PDFJS.InvalidPDFException) {
//         // change error message also for other builds
//         loadingErrorMessage = l10n.get('invalid_file_error', null,
//           'Invalid or corrupted PDF file.');
//       } else if (exception instanceof PDFJS.MissingPDFException) {
//         // special message for missing PDFs
//         loadingErrorMessage = l10n.get('missing_file_error', null,
//           'Missing PDF file.');
//       } else if (exception instanceof PDFJS.UnexpectedResponseException) {
//         loadingErrorMessage = l10n.get('unexpected_response_error', null,
//           'Unexpected server response.');
//       } else {
//         loadingErrorMessage = l10n.get('loading_error', null,
//           'An error occurred while loading the PDF.');
//       }

//       loadingErrorMessage.then(function (msg) {
//         self.error(msg, {message: message});
//       });
//       self.loadingBar.hide();
//     });
//   },

//   /**
//   * Closes opened PDF document.
//   * @returns {Promise} - Returns the promise, which is resolved when all
//   *                      destruction is completed.
//   */
//   close: function () {
//     var errorWrapper = document.getElementById('errorWrapper');
//     errorWrapper.setAttribute('hidden', 'true');

//     if (!this.pdfLoadingTask) {
//       return Promise.resolve();
//     }

//     var promise = this.pdfLoadingTask.destroy();
//     this.pdfLoadingTask = null;

//     if (this.pdfDocument) {
//       this.pdfDocument = null;

//       this.pdfViewer.setDocument(null);
//       this.pdfLinkService.setDocument(null, null);
//     }

//     return promise;
//   },

//   get loadingBar() {
//     var bar = new PDFJS.ProgressBar('#loadingBar', {});

//     return PDFJS.shadow(this, 'loadingBar', bar);
//   },

//   error: function pdfViewError(message, moreInfo) {
//     var l10n = this.l10n;
//     var moreInfoText = [l10n.get('error_version_info',
//       {version: PDFJS.version || '?', build: PDFJS.build || '?'},
//       'PDF.js v{{version}} (build: {{build}})')];

//     if (moreInfo) {
//       moreInfoText.push(
//         l10n.get('error_message', {message: moreInfo.message},
//           'Message: {{message}}'));
//       if (moreInfo.stack) {
//         moreInfoText.push(
//           l10n.get('error_stack', {stack: moreInfo.stack},
//             'Stack: {{stack}}'));
//       } else {
//         if (moreInfo.filename) {
//           moreInfoText.push(
//             l10n.get('error_file', {file: moreInfo.filename},
//               'File: {{file}}'));
//         }
//         if (moreInfo.lineNumber) {
//           moreInfoText.push(
//             l10n.get('error_line', {line: moreInfo.lineNumber},
//               'Line: {{line}}'));
//         }
//       }
//     }

//     var errorWrapper = document.getElementById('errorWrapper');
//     errorWrapper.removeAttribute('hidden');

//     var errorMessage = document.getElementById('errorMessage');
//     errorMessage.textContent = message;

//     var closeButton = document.getElementById('errorClose');
//     closeButton.onclick = function() {
//       errorWrapper.setAttribute('hidden', 'true');
//     };

//     var errorMoreInfo = document.getElementById('errorMoreInfo');
//     var moreInfoButton = document.getElementById('errorShowMore');
//     var lessInfoButton = document.getElementById('errorShowLess');
//     moreInfoButton.onclick = function() {
//       errorMoreInfo.removeAttribute('hidden');
//       moreInfoButton.setAttribute('hidden', 'true');
//       lessInfoButton.removeAttribute('hidden');
//       errorMoreInfo.style.height = errorMoreInfo.scrollHeight + 'px';
//     };
//     lessInfoButton.onclick = function() {
//       errorMoreInfo.setAttribute('hidden', 'true');
//       moreInfoButton.removeAttribute('hidden');
//       lessInfoButton.setAttribute('hidden', 'true');
//     };
//     moreInfoButton.removeAttribute('hidden');
//     lessInfoButton.setAttribute('hidden', 'true');
//     Promise.all(moreInfoText).then(function (parts) {
//       errorMoreInfo.value = parts.join('\n');
//     });
//   },

//   progress: function pdfViewProgress(level) {
//     var percent = Math.round(level * 100);
//     // Updating the bar if value increases.
//     if (percent > this.loadingBar.percent || isNaN(percent)) {
//       this.loadingBar.percent = percent;
//     }
//   },

//   get pagesCount() {
//     return this.pdfDocument.numPages;
//   },

//   set page(val) {
//     this.pdfViewer.currentPageNumber = val;
//   },

//   get page() {
//     return this.pdfViewer.currentPageNumber;
//   },

//   zoomIn: function pdfViewZoomIn(ticks) {
//     var newScale = this.pdfViewer.currentScale;
//     do {
//       newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
//       newScale = Math.ceil(newScale * 10) / 10;
//       newScale = Math.min(MAX_SCALE, newScale);
//     } while (--ticks && newScale < MAX_SCALE);
//     this.pdfViewer.currentScaleValue = newScale;
//   },

//   zoomOut: function pdfViewZoomOut(ticks) {
//     var newScale = this.pdfViewer.currentScale;
//     do {
//       newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
//       newScale = Math.floor(newScale * 10) / 10;
//       newScale = Math.max(MIN_SCALE, newScale);
//     } while (--ticks && newScale > MIN_SCALE);
//     this.pdfViewer.currentScaleValue = newScale;
//   },
  
//   fullscreen: function pdfViewFullscreen() {
    
//   },

//   forceRendering: function pdfViewForceRendering() {
//     this.pdfRenderingQueue.printing = this.printing;
//     this.pdfRenderingQueue.isThumbnailViewEnabled =
//       this.pdfSidebar.isThumbnailViewVisible;
//     this.pdfRenderingQueue.renderHighestPriority();
//   },
  
//   rotatePages: function pdfViewRotatePages(delta) {
//     var pageNumber = this.page;

//     if (isNaN(this.pageRotation)) {
//       this.pageRotation = 0;
//     }

//     this.pageRotation = (this.pageRotation + 360 + delta) % 360;
//     this.pdfViewer.pagesRotation = this.pageRotation;
//     this.pdfThumbnailViewer.pagesRotation = this.pageRotation;

//     this.forceRendering();

//     this.pdfViewer.currentPageNumber = pageNumber;
//   },

//   initUI: function pdfViewInitUI() {
//     var linkService = new PDFJS.PDFLinkService();
//     this.pdfLinkService = linkService;

//     this.l10n = PDFJS.NullL10n;

//     var container = document.getElementById('viewerContainer');
//     var pdfViewer = new PDFJS.PDFViewer({
//       container: container,
//       linkService: linkService,
//       l10n: this.l10n,
//     });
//     this.pdfViewer = pdfViewer;
//     linkService.setViewer(pdfViewer);

//     // var pdfRenderingQueue = new PDFRenderingQueue();
//     // pdfRenderingQueue.onIdle = this.cleanup.bind(this);
//     // this.pdfRenderingQueue = pdfRenderingQueue;

//     // var thumbnailContainer = document.getElementById('thumbnailView');
//     // this.pdfThumbnailViewer = new PDFThumbnailViewer({
//     //   container: thumbnailContainer,
//     //   // renderingQueue: pdfRenderingQueue,
//     //   linkService: this.pdfLinkService
//     // });

//     this.pdfHistory = new PDFJS.PDFHistory({
//       linkService: linkService
//     });
//     linkService.setHistory(this.pdfHistory);

//     document.getElementById('previous').addEventListener('click', function() {
//       PDFViewerApplication.page--;
//     });

//     document.getElementById('next').addEventListener('click', function() {
//       PDFViewerApplication.page++;
//     });

//     document.getElementById('zoomIn').addEventListener('click', function() {
//       PDFViewerApplication.zoomIn();
//     });

//     document.getElementById('zoomOut').addEventListener('click', function() {
//       PDFViewerApplication.zoomOut();
//     });

//     document.getElementById('secondaryPresentationMode').addEventListener('click', function() {
//       PDFViewerApplication.fullscreen();
//     });

//     document.getElementById('pageRotateCw').addEventListener('click', function() {
//       PDFViewerApplication.rotatePages(90);
//     });

//     document.getElementById('pageRotateCcw').addEventListener('click', function() {
//       PDFViewerApplication.rotatePages(-90);
//     });

//     document.getElementById('pageNumber').addEventListener('click', function() {
//       this.select();
//     });

//     document.getElementById('pageNumber').addEventListener('change',
//         function() {
//       PDFViewerApplication.page = (this.value | 0);

//       // Ensure that the page number input displays the correct value, even if the
//       // value entered by the user was invalid (e.g. a floating point number).
//       if (this.value !== PDFViewerApplication.page.toString()) {
//         this.value = PDFViewerApplication.page;
//       }
//     });

//     container.addEventListener('pagesinit', function () {
//       // We can use pdfViewer now, e.g. let's change default scale.
//       pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
//     });

//     container.addEventListener('pagechange', function (evt) {
//       var page = evt.pageNumber;
//       var numPages = PDFViewerApplication.pagesCount;

//       document.getElementById('pageNumber').value = page;
//       document.getElementById('previous').disabled = (page <= 1);
//       document.getElementById('next').disabled = (page >= numPages);
//     }, true);
//   }
// };


// function toggleFullScreen() {
// 	if (!document.fullscreenElement &&
// 		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
//   		if (document.documentElement.requestFullscreen) {
//   			document.documentElement.requestFullscreen();
//   		} else if (document.documentElement.msRequestFullscreen) {
//   			document.documentElement.msRequestFullscreen();
//   		} else if (document.documentElement.mozRequestFullScreen) {
//   			document.documentElement.mozRequestFullScreen();
//   		} else if (document.documentElement.webkitRequestFullscreen) {
//   			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
//   		}
//   	} else {
//   		if (document.exitFullscreen) {
//   			document.exitFullscreen();
//   		} else if (document.msExitFullscreen) {
//   			document.msExitFullscreen();
//   		} else if (document.mozCancelFullScreen) {
//   			document.mozCancelFullScreen();
//   		} else if (document.webkitExitFullscreen) {
//   			document.webkitExitFullscreen();
//   		}
//   	}
// }

// jQuery(document).ready(function($) {
//   PDFViewerApplication.initUI();

//   (function animationStartedClosure() {
//     // The offsetParent is not set until the PDF.js iframe or object is visible.
//     // Waiting for first animation.
//     PDFViewerApplication.animationStartedPromise = new Promise(
//       function (resolve) {
//         window.requestAnimationFrame(resolve);
//       });
//   })();
  
//   // We need to delay opening until all HTML is loaded.
//   PDFViewerApplication.animationStartedPromise.then(function () {
//     PDFViewerApplication.open({
//       url: DEFAULT_URL
//     });
//   });
// });


// 2 TRY

// function getViewerConfiguration() {
//   return {
//     appContainer: document.body,
//     mainContainer: document.getElementById('viewerContainer'),
//     viewerContainer: document.getElementById('viewer'),
//     eventBus: null, // using global event bus with DOM events
//     toolbar: {
//       container: document.getElementById('toolbarViewer'),
//       numPages: document.getElementById('numPages'),
//       pageNumber: document.getElementById('pageNumber'),
//       scaleSelectContainer: document.getElementById('scaleSelectContainer'),
//       scaleSelect: document.getElementById('scaleSelect'),
//       customScaleOption: document.getElementById('customScaleOption'),
//       previous: document.getElementById('previous'),
//       next: document.getElementById('next'),
//       zoomIn: document.getElementById('zoomIn'),
//       zoomOut: document.getElementById('zoomOut'),
//       viewFind: document.getElementById('viewFind'),
//       openFile: document.getElementById('openFile'),
//       print: document.getElementById('print'),
//       presentationModeButton: document.getElementById('presentationMode'),
//       download: document.getElementById('download'),
//       viewBookmark: document.getElementById('viewBookmark'),
//     },
//     secondaryToolbar: {
//       toolbar: document.getElementById('secondaryToolbar'),
//       toggleButton: document.getElementById('secondaryToolbarToggle'),
//       toolbarButtonContainer:
//         document.getElementById('secondaryToolbarButtonContainer'),
//       presentationModeButton:
//         document.getElementById('secondaryPresentationMode'),
//       openFileButton: document.getElementById('secondaryOpenFile'),
//       printButton: document.getElementById('secondaryPrint'),
//       downloadButton: document.getElementById('secondaryDownload'),
//       viewBookmarkButton: document.getElementById('secondaryViewBookmark'),
//       firstPageButton: document.getElementById('firstPage'),
//       lastPageButton: document.getElementById('lastPage'),
//       pageRotateCwButton: document.getElementById('pageRotateCw'),
//       pageRotateCcwButton: document.getElementById('pageRotateCcw'),
//       cursorSelectToolButton: document.getElementById('cursorSelectTool'),
//       cursorHandToolButton: document.getElementById('cursorHandTool'),
//       documentPropertiesButton: document.getElementById('documentProperties'),
//     },
//     fullscreen: {
//       contextFirstPage: document.getElementById('contextFirstPage'),
//       contextLastPage: document.getElementById('contextLastPage'),
//       contextPageRotateCw: document.getElementById('contextPageRotateCw'),
//       contextPageRotateCcw: document.getElementById('contextPageRotateCcw'),
//     },
//     sidebar: {
//       // Divs (and sidebar button)
//       outerContainer: document.getElementById('outerContainer'),
//       viewerContainer: document.getElementById('viewerContainer'),
//       toggleButton: document.getElementById('sidebarToggle'),
//       // Buttons
//       thumbnailButton: document.getElementById('viewThumbnail'),
//       outlineButton: document.getElementById('viewOutline'),
//       attachmentsButton: document.getElementById('viewAttachments'),
//       // Views
//       thumbnailView: document.getElementById('thumbnailView'),
//       outlineView: document.getElementById('outlineView'),
//       attachmentsView: document.getElementById('attachmentsView'),
//     },
//     sidebarResizer: {
//       outerContainer: document.getElementById('outerContainer'),
//       resizer: document.getElementById('sidebarResizer'),
//     },
//     findBar: {
//       bar: document.getElementById('findbar'),
//       toggleButton: document.getElementById('viewFind'),
//       findField: document.getElementById('findInput'),
//       highlightAllCheckbox: document.getElementById('findHighlightAll'),
//       caseSensitiveCheckbox: document.getElementById('findMatchCase'),
//       findMsg: document.getElementById('findMsg'),
//       findResultsCount: document.getElementById('findResultsCount'),
//       findStatusIcon: document.getElementById('findStatusIcon'),
//       findPreviousButton: document.getElementById('findPrevious'),
//       findNextButton: document.getElementById('findNext'),
//     },
//     passwordOverlay: {
//       overlayName: 'passwordOverlay',
//       container: document.getElementById('passwordOverlay'),
//       label: document.getElementById('passwordText'),
//       input: document.getElementById('password'),
//       submitButton: document.getElementById('passwordSubmit'),
//       cancelButton: document.getElementById('passwordCancel'),
//     },
//     documentProperties: {
//       overlayName: 'documentPropertiesOverlay',
//       container: document.getElementById('documentPropertiesOverlay'),
//       closeButton: document.getElementById('documentPropertiesClose'),
//       fields: {
//         'fileName': document.getElementById('fileNameField'),
//         'fileSize': document.getElementById('fileSizeField'),
//         'title': document.getElementById('titleField'),
//         'author': document.getElementById('authorField'),
//         'subject': document.getElementById('subjectField'),
//         'keywords': document.getElementById('keywordsField'),
//         'creationDate': document.getElementById('creationDateField'),
//         'modificationDate': document.getElementById('modificationDateField'),
//         'creator': document.getElementById('creatorField'),
//         'producer': document.getElementById('producerField'),
//         'version': document.getElementById('versionField'),
//         'pageCount': document.getElementById('pageCountField'),
//       },
//     },
//     errorWrapper: {
//       container: document.getElementById('errorWrapper'),
//       errorMessage: document.getElementById('errorMessage'),
//       closeButton: document.getElementById('errorClose'),
//       errorMoreInfo: document.getElementById('errorMoreInfo'),
//       moreInfoButton: document.getElementById('errorShowMore'),
//       lessInfoButton: document.getElementById('errorShowLess'),
//     },
//     printContainer: document.getElementById('printContainer'),
//     openFileInputName: 'fileInput',
//     // debuggerScriptPath: './debugger.js',
//     defaultUrl: DEFAULT_URL,
//   };
// }

// function webViewerLoad() {
//   var config = getViewerConfiguration();
//   debugger;
  
//   // var pdfViewer = new PDFJS.PDFViewer({
//   //   config: config,
//   //   l10n: this.l10n,
//   // });
//   // this.pdfViewer = pdfViewer;
  
//   // var linkService = new PDFJS.PDFLinkService();
//   // this.pdfLinkService = linkService;

//   // this.l10n = PDFJS.NullL10n;

//   // var container = document.getElementById('viewerContainer');
//   // var pdfViewer = new PDFJS.PDFViewer({
//   //   container: container,
//   //   linkService: linkService,
//   //   l10n: this.l10n,
//   // });
//   // this.pdfViewer = pdfViewer;
//   // linkService.setViewer(pdfViewer);
  
  
  
//   // window.PDFViewerApplication = pdfjsWebApp.PDFViewerApplication;
//   // pdfjsWebApp.PDFViewerApplication.run(config);
// }

// if (document.readyState === 'interactive' ||
//     document.readyState === 'complete') {
//   webViewerLoad();
// } else {
//   document.addEventListener('DOMContentLoaded', webViewerLoad, true);
// }
