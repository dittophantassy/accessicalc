/**
 * A small command line editor to demonstrate the math.js parser.
 * @param {Object} params    Configuration parameter. Available:
 *                           {HTMLElement} container DOM Element to contain
 *                                                   the editor
 *                           {Object} [math]         An instance of math.js
 *                           {String} [id]           Optional id for the editor,
 *                                                   used to persist data.
 *                                                   "default" by default.
 */
function CommandLineEditor (params) {
  // get instance of math.js from params, or create one
  var math = params.math || mathjs();

  // object with utility methods
  var util = {};

  /**
   * Returns the version of Internet Explorer or a -1
   * (indicating the use of another browser).
   * Source: http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
   * @return {Number} Internet Explorer version, or -1 in case of an other browser
   */
  util.getInternetExplorerVersion = function getInternetExplorerVersion () {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
      var ua = navigator.userAgent;
      var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null) {
        rv = parseFloat( RegExp.$1 );
      }
    }
    return rv;
  };

  /**
   * Add and event listener
   * @param {Element}  element       An html element
   * @param {string}   action        The action, for example "click",
   *                                 without the prefix "on"
   * @param {function}    listener   The callback function to be executed
   */
  util.addEventListener = function addEventListener(element, action, listener) {
    if (element.addEventListener) {
      element.addEventListener(action, listener, false);
    } else {
      element.attachEvent('on' + action, listener);  // IE browsers
    }
  };

  /**
   * Remove an event listener from an element
   * @param {Element}  element   An html dom element
   * @param {string}   action    The name of the event, for example "mousedown"
   * @param {function} listener  The listener function
   */
  util.removeEventListener = function removeEventListener (element, action, listener) {
    if (element.removeEventListener) {
      element.removeEventListener(action, listener, false);
    } else {
      element.detachEvent('on' + action, listener);  // IE browsers
    }
  };

  /**
   * Stop event propagation
   */
  util.stopPropagation = function stopPropagation (event) {
    if (event.stopPropagation) {
      event.stopPropagation();  // non-IE browsers
    }
    else {
      event.cancelBubble = true;  // IE browsers
    }
  };

  /**
   * Cancels the event if it is cancelable, without stopping further propagation of the event.
   */
  util.preventDefault = function preventDefault (event) {
    if (event.preventDefault) {
      event.preventDefault();  // non-IE browsers
    }
    else {
      event.returnValue = false;  // IE browsers
    }
  };

  /**
   * Clear all DOM childs from an element
   * @param {HTMLElement} element
   */
  util.clearDOM = function clearDOM (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  // read the parameters
  var container = (params && params.container) ? params.container : undefined;
  if (!container) {
    throw new Error('Required parameter "container" missing in configuration parameters');
  }
  var id = (params && params.id) ? String(params.id) : 'default';

  // clear the container
  util.clearDOM(container);

  // validate if math.js is loaded.
  var error;
  if (typeof math === 'undefined' || !math.parser) {
    error = document.createElement('div');
    error.appendChild(document.createTextNode(
        'Cannot create parser, math.js not loaded.'));
    error.style.color = 'red';
    container.appendChild(error);
    return;
  }

  // validate browser
  // the editor does not work well on IE7
  // TODO: make the demo working on IE7
  var ieVersion = util.getInternetExplorerVersion();
  if (ieVersion == 6 || ieVersion == 7) {
    error = document.createElement('div');
    error.appendChild(document.createTextNode(
        'Sorry, this demo is not available on IE7 and older. The math.js ' +
            'library itself works fine on every version of IE though.'));
    error.style.color = 'red';
    container.appendChild(error);
    return;
  }

  // define parameters
  var dom = {},
      fullscreen = false,
      history = [],
      historyIndex = -1,
      parser = math.parser();

  function resize() {
    // position the full screen button in the top right
    var top = 8;
    var right = (dom.topPanel.clientWidth - dom.results.clientWidth) + 6;
    dom.fullscreen.style.top = top + 'px';
    dom.fullscreen.style.right = right + 'px';
  }

  function toggleFullscreen() {
    if (fullscreen) {
      exitFullscreen();
    }
    else {
      showFullscreen()
    }
  }

  function showFullscreen() {
    dom.frame.className = 'cle fullscreen';
    document.body.style.overflow = 'hidden'; // (works only if body.style.height is defined)
    fullscreen = true;
    resize();
    scrollDown();
    dom.input.focus();
  }

  function exitFullscreen() {
    dom.frame.className = 'cle';
    document.body.style.overflow = '';
    fullscreen = false;
    resize();
    scrollDown();
  }

  function scrollDown() {
    dom.results.scrollTop = dom.results.scrollHeight;
  }

  // Auto complete current input
  function autoComplete () {
    var text = dom.input.value;
    var end = /[a-zA-Z_0-9]+$/.exec(text);
    if (end) {
      var keyword = end[0];
      var matches = [];

      // scope variables
      // TODO: not nice to read the (private) defs inside the scope
      for (var def in parser.scope.defs) {
        if (parser.scope.defs.hasOwnProperty(def)) {
          if (def.indexOf(keyword) == 0) {
            matches.push(def);
          }
        }
      }

      // commandline keywords
      if ('clear'.indexOf(keyword) == 0) {
        matches.push('clear');
      }

      // math functions and constants
      var ignore = ['expr', 'type'];
      for (var func in math) {
        if (math.hasOwnProperty(func)) {
          if (func.indexOf(keyword) == 0 && ignore.indexOf(func) == -1) {
            matches.push(func);
          }
        }
      }

      // units
      var Unit = math.type.Unit;
      Unit.UNITS.forEach(function (unit) {
        if (unit.name.indexOf(keyword) == 0) {
          matches.push(unit.name);
        }
      });
      for (var name in Unit.PREFIXES) {
        if (Unit.PREFIXES.hasOwnProperty(name)) {
          var prefixes = Unit.PREFIXES[name];
          for (var prefix in prefixes) {
            if (prefixes.hasOwnProperty(prefix)) {
              if (prefix.indexOf(keyword) == 0) {
                matches.push(prefix);
              }
              else if (keyword.indexOf(prefix) == 0) {
                var unitKeyword = keyword.substring(prefix.length);
                Unit.UNITS.forEach(function (unit) {
                  if (unit.name.indexOf(unitKeyword) == 0 &&
                      Unit.isPlainUnit(prefix + unit.name)) {
                    matches.push(prefix + unit.name);
                  }
                });

              }
            }
          }
        }
      }

      // TODO: in case of multiple matches, show a drop-down box to select one
      var firstMatch = matches[0];
      if (firstMatch) {
        text = text.substring(0, text.length - keyword.length) + firstMatch;
        dom.input.value = text;
      }
    }
  }

  /**
   * KeyDown event handler to catch global key presses in the window
   * @param {Event} event
   */
  function onWindowKeyDown (event) {
    if (dom.frame.parentNode != container) {
      destroy();
    }

    event = event || window.event;
    var target = event.target || event.srcElement;
    var keynum = event.which || event.keyCode;
    if (keynum == 83) { // s
      if (target != dom.input) {
        dom.input.focus();
        util.preventDefault(event);
        util.stopPropagation(event);
      }
    }
    else if (keynum == 27) { // ESC
      if (fullscreen) {
        exitFullscreen();
        util.preventDefault(event);
        util.stopPropagation(event);
      }
    }
    else if (event.ctrlKey && keynum == 122) { // Ctrl+F11
      toggleFullscreen();
      if (fullscreen) {
        dom.input.focus();
      }
      util.preventDefault(event);
      util.stopPropagation(event);
    }
  }

  /**
   * Resize event handler
   */
  function onWindowResize () {
    if (dom.frame.parentNode != container) {
      destroy();
    }

    resize();
  }

  /**
   * KeyDown handler for the input field
   * @param event
   * @returns {boolean}
   */
  function onKeyDown (event) {
    event = event || window.event;

    var keynum = event.which || event.keyCode;
    switch (keynum) {
      case 9: // Tab
        autoComplete();
        util.preventDefault(event);
        util.stopPropagation(event);
        return false;
        break;

      case 13: // Enter
        evalInput();
        util.preventDefault(event);
        util.stopPropagation(event);
        return false;
        break;

      case 38: // Arrow up
        if (historyIndex > 0) {
          historyIndex--;
          dom.input.value = history[historyIndex] || '';
          util.preventDefault(event);
          util.stopPropagation(event);
        }
        return false;
        break;

      case 40: // Arrow down
        if (historyIndex < history.length) {
          historyIndex++;
          dom.input.value = history[historyIndex] || '';
          util.preventDefault(event);
          util.stopPropagation(event);
        }
        return false;
        break;

      default:
        historyIndex = history.length;
        break;
    }

    return true;
  }

  /**
   * Destroy the editor: cleanup HTML DOM and global event listeners
   */
  function create() {
    // create main frame for the editor
    dom.frame = document.createElement('div');
    dom.frame.className = 'cle';
    container.appendChild(dom.frame);

    // create two panels for the layout
    dom.topPanel = document.createElement('div');
    dom.topPanel.className = 'top-panel';
    dom.frame.appendChild(dom.topPanel);
    dom.bottomPanel = document.createElement('div');
    dom.bottomPanel.className = 'bottom-panel';
    dom.frame.appendChild(dom.bottomPanel);

    // create div to hold the results
    dom.results = document.createElement('div');
    dom.results.className = 'results';
    dom.topPanel.appendChild(dom.results);

    // create fullscreen button
    dom.fullscreen = document.createElement('button');
    dom.fullscreen.className = 'fullscreen';
    dom.fullscreen.title = 'Toggle full screen display (Ctrl+F11)';
    dom.fullscreen.onclick = toggleFullscreen;
    dom.topPanel.appendChild(dom.fullscreen);

    // panels for the input field and button
    dom.inputLeft = document.createElement('div');
    dom.inputLeft.className = 'input-left';
    dom.bottomPanel.appendChild(dom.inputLeft);
    dom.inputRight = document.createElement('div');
    dom.inputRight.className = 'input-right';
    dom.bottomPanel.appendChild(dom.inputRight);

    dom.input = document.createElement('input');
    dom.input.className = 'input';
    dom.input.title = 'Enter an expression';
    dom.input.onkeydown = onKeyDown;
    dom.inputLeft.appendChild(dom.input);
    dom.input.id="input"
    
    // create an eval button
    dom.btnEval = document.createElement('button');
    dom.btnEval.appendChild(document.createTextNode('calcular'));
    dom.btnEval.className = 'eval';
    dom.btnEval.title = 'calcular la expression (Enter)';
    dom.btnEval.onclick = evalInput;
    dom.inputRight.appendChild(dom.btnEval);

    // create global event listeners
    util.addEventListener(window, 'keydown', onWindowKeyDown);
    util.addEventListener(window, 'resize', onWindowResize);
  }

  /**
   * Destroy the editor: cleanup HTML DOM and global event listeners
   */
  function destroy() {
    // destroy DOM
    if (dom.frame.parentNode) {
      dom.frame.parentNode.removeChild(dom.frame);
    }

    // destroy event listeners
    util.removeEventListener(window, 'keydown', onWindowKeyDown);
    util.removeEventListener(window, 'resize', onWindowResize);
  }

  /**
   * Trim a string
   * http://stackoverflow.com/a/498995/1262753
   * @param str
   * @return {*|void}
   */
  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /**
   * Load saved expressions or example expressions
   */
  function load() {
    var expressions;
    if (localStorage) {
      // load expressions from local storage
      var data = localStorage[id];
      if (data) {
        expressions = JSON.parse(data);
      }
    }
    if (!expressions || !(expressions instanceof Array)) {
      // load some example expressions
      expressions = [
        '1.2 / (2.3 + 0.7)',
        'a = 5.08 cm + 1 inch',
        'a in inch',
        'sin(45 deg) ^ 2',
        'function f(x, y) = x ^ y',
        'f(2, 3)'
      ];
    }

    // evaluate all expressions
    expressions.forEach(function (expr) {
      eval(expr);
    });
  }

  /**
   * Save executed expressions
   */
  function save() {
    if (localStorage) {
      localStorage[id] = JSON.stringify(history);
    }
  }

  function clear() {
    history = [];
    historyIndex = -1;
    parser.clear();

    util.clearDOM(dom.results);
    dom.input.value = '';
    resize();
    // save(); // TODO: save expressions (first we need a method to restore the examples)
  }

  function eval (expr) {
    expr = trim(expr);

    if (expr == 'clear') {
      clear();
      return;
    }

    if (expr) {
      history.push(expr);
      historyIndex = history.length;

      var res;
      try {
        res = math.format(parser.eval(expr), {
          precision: 5
        });
      }
      catch (err) {
        res = err.toString();
      }

      var preExpr = document.createElement('pre');
      preExpr.className = 'expr';
      preExpr.appendChild(document.createTextNode(expr));
      dom.results.appendChild(preExpr);

      var preRes = document.createElement('pre');
      preRes.className = 'res';
      //preRes.setAttribute("aria-busy","false")
      preRes.setAttribute("role","log")
      preRes.setAttribute("aria-live","assertive")
      preRes.setAttribute("aria-atomic","false")
      preRes.setAttribute("aria-relevant","additions")
      preRes.appendChild(document.createTextNode(filterOut(res)));
      dom.results.appendChild(preRes);

      scrollDown();
      dom.input.value = '';

      resize();
      // save();  // TODO: save expressions (first we need a method to restore the examples)
    }
  }

  function evalInput() {
    eval(filterIn(dom.input.value));
  }

  create();
  load();
  document.getElementById("input").focus()
}