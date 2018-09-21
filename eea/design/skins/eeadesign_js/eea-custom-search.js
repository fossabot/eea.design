if (window.EEA === undefined) {
  var EEA = {
    who: "eea.design",
    feature: "Custom Search",
    version: 1.0
  };
}

EEA.CustomSearch = function (context) {
  var self = this;
  self.focus = -1;
  self.context = context;
  self.form = self.context.closest("form");
  self.getting_tags = false;
  self.tags_url = self.form.getAttribute("data-tags-url");
  self.tags = [];
  self.template = {
    'query': {
      'function_score': {
        'query': {
          'bool': {
            'filter': {
              'bool': {
                'should': [{ 'term': { 'language': 'en' } }]
              }
            },
            'must': {
              'bool': {
                'must': [{
                  'query_string': {
                    'query': ""
                  }
                }]
              }
            }
          }
        }
      }
    }
  };
  self.initialize();
};

EEA.CustomSearch.prototype = {
  initialize: function () {
    var self = this;
    self.init_source();
    self.init_autocomplete();

    // Bind events

    // Click outside search input
    document.addEventListener("click", function (e) {
      self.close_all_lists(e.target);
    });

    // Form submit
    self.form.addEventListener('submit', function (e) {
      self.form_submit();
    });

    // Input value changed
    self.context.addEventListener('change', function (e) {
      self.input_changed(this.value);
    });

    // Click and type within search input
    self.context.addEventListener("input", function (e) {
      if(self.getting_tags){
        clearTimeout(self.getting_tags);
      }
      self.getting_tags = setTimeout(function(){
        self.input_input(self.context.value);
      }, 300);
    });

    // Key press events
    self.context.addEventListener("keydown", function (e) {
      self.input_keydown(e);
    });
  },

  init_source: function () {
    var self = this;
    self.source = document.createElement("input");
    self.source.name = "source";
    self.source.type = "hidden";
    self.context.parentNode.appendChild(self.source);
  },

  init_autocomplete: function () {
    var self = this;
    self.autocomplete = document.createElement("div");
    self.autocomplete.setAttribute("class", "autocomplete-items");
    self.context.parentNode.appendChild(self.autocomplete);
  },

  input_input: function (val) {
    var self = this;
    if (!self.tags_url) {
      return;
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        self.tags = JSON.parse(this.responseText);
        self.input_tags_ready(val);
      }
    };
    var url = self.tags_url + "?q=" + val;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  },

  input_tags_ready: function (val) {
    var self = this;
    var a, b, i;
    self.close_all_lists();
    if (!val) {
      return false;
    }
    self.focus = -1;
    for (i = 0; i < self.tags.length; i++) {
      b = document.createElement("div");
      b.setAttribute("class", "autocomplete-item");
      b.innerHTML = "<strong>" + self.tags[i].substr(0, val.length) + "</strong>";
      b.innerHTML += self.tags[i].substr(val.length);
      b.setAttribute("data-tag", self.tags[i]);
      b.addEventListener("click", function (e) {
        self.context.value = this.getAttribute("data-tag");
        self.close_all_lists();
      });
      self.autocomplete.appendChild(b);
    }
  },

  input_keydown: function (e) {
    var self = this;
    var x = self.autocomplete.getElementsByTagName("div");
    if (e.keyCode == 40) {  // down
      self.focus++;
      self.add_active(x);
    } else if (e.keyCode == 38) { // up
      self.focus--;
      self.add_active(x);
    } else if (e.keyCode == 13) { // enter
      if (self.focus > -1) {
        x[self.focus].click();
      }
    }
  },

  input_changed: function (value) {
    var self = this;
    self.template.query.function_score.query.bool.must.bool.must[0].query_string.query = encodeURIComponent(value);
    self.source.value = JSON.stringify(self.template);
  },

  form_submit: function () {
    var self = this;
    self.context.placeholder = self.context.value;
    self.context.value = '';
  },

  close_all_lists: function (elmnt) {
    var self = this;
    while (self.autocomplete.firstChild) {
      self.autocomplete.removeChild(self.autocomplete.firstChild);
    }
  },

  add_active: function (x) {
    var self = this;
    if (!x.length) {
      return false;
    }

    self.remove_active(x);
    if (self.focus >= x.length) {
      self.focus = 0;
    }

    if (self.focus < 0) {
      self.focus = (x.length - 1);
    }

    x[self.focus].classList.add("autocomplete-active");
  },

  remove_active: function (x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
};

if (document.getElementById('gsc-input-query')) {
  var cs = new EEA.CustomSearch(document.getElementById('gsc-input-query'));
}
