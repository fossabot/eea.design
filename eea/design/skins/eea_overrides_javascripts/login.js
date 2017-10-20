// Functions used by login pages

function cookiesEnabled() {
  // Test whether cookies are enabled by attempting to set a cookie and then change its value
  // set test cookie
  var c = "areYourCookiesEnabled=0";
  document.cookie = c;
  var dc = document.cookie;
  // cookie not set?  fail
  if (dc.indexOf(c) === -1) { return 0; }
  // change test cookie
  c = "areYourCookiesEnabled=1";
  document.cookie = c;
  dc = document.cookie;
  // cookie not changed?  fail
  if (dc.indexOf(c) === -1) { return 0; }
  // delete cookie
  document.cookie = "areYourCookiesEnabled=; expires=Thu, 01-Jan-01 00:00:01 GMT";
  return 1;
}

function setLoginVars(user_name_id, alt_user_name_id, password_id, empty_password_id, js_enabled_id, cookies_enabled_id) {
  // Indicate that javascript is enabled, set cookie status, copy username and password length info to
  // alternative variables since these vars are removed from the request by zope's authentication mechanism.
  if (js_enabled_id) {
    var els = document.getElementsByName(js_enabled_id);
    if (els) {
      for (var i = 0; i < els.length; i++){
        els[i].value = 1;
      }
    }
  }
  if (cookies_enabled_id) {
    els = document.getElementsByName(cookies_enabled_id);
    // Do a fresh cookies enabled test every time we press the login button
    //   so that we are up to date in case the user enables cookies after seeing
    //   the cookies message.
    if (els) {
      for (var i = 0; i < els.length; i++){
        els[i].value = cookiesEnabled();
      }
    }
  }
  if (user_name_id && alt_user_name_id) {
    user_names = document.getElementsByName(user_name_id);
    alt_user_names = document.getElementsByName(alt_user_name_id);
    if (user_names && alt_user_names) {
      for (var i = 0; i < user_names.length; i++){
        alt_user_names[i].value = user_names[i].value;
      }
    }
  }
  if (password_id && empty_password_id) {
    passwords = document.getElementsByName(password_id);
    empty_passwords = document.getElementsByName(empty_password_id);
    if (passwords && empty_passwords) {
      for (var i = 0; i < passwords.length; i++){
        if (passwords[i].value.length === 0) {
          empty_passwords[i].value = '1';
        } else {
          empty_passwords[i].value = '0';
        }
      }
    }
  }
  return 1;
}

function showCookieMessage(msg_class) {
  // Show the element with the given class if cookies are not enabled
  msg = document.getElementsByClassName(msg_class);
  if (msg) {
    for (var i = 0; i < msg.length; i++){
      if (cookiesEnabled()) {
        msg[i].style.display = 'none';
      } else {
        msg[i].style.display = 'block';
      }
    }
  }
}

function showEnableCookiesMessage() {
  // Show the element with the class 'enable_cookies_message' if cookies are not enabled
  showCookieMessage('enable_cookies_message');
}
// Call showEnableCookiesMessage after the page loads
registerPloneFunction(showEnableCookiesMessage);
