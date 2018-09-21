""" Redirect to glossary.eea.europa.eu
"""
import json
from Products.Five.browser import BrowserView

GLOSSARY = "http://glossary.{lang}.eea.europa.eu"
SEARCH = "/terminology/sitesearch?term="

DUMMY_TAGS = [
    "Afghanistan","Albania","Algeria","Andorra",
    "Angola","Anguilla","Antigua &amp; Barbuda",
    "Argentina","Armenia","Aruba","Australia",
    "Austria","Azerbaijan","Bahamas","Bahrain",
    "Bangladesh","Barbados","Belarus","Belgium",
    "Belize","Benin","Bermuda","Bhutan","Bolivia",
    "Bosnia &amp; Herzegovina","Botswana","Brazil",
    "British Virgin Islands","Brunei","Bulgaria",
    "Burkina Faso","Burundi","Cambodia","Cameroon",
    "Canada","Cape Verde","Cayman Islands",
    "Central Arfrican Republic","Chad","Chile",
    "China","Colombia","Congo","Cook Islands",
    "Costa Rica","Cote D Ivoire","Croatia","Cuba",
    "Curacao","Cyprus","Czech Republic","Denmark",
    "Djibouti","Dominica","Dominican Republic",
    "Ecuador","Egypt","El Salvador","Equatorial Guinea",
    "Eritrea","Estonia","Ethiopia","Falkland Islands",
    "Faroe Islands","Fiji","Finland","France",
    "French Polynesia","French West Indies",
    "Gabon","Gambia","Georgia","Germany","Ghana",
    "Gibraltar","Greece","Greenland","Grenada","Guam",
    "Guatemala","Guernsey","Guinea","Guinea Bissau",
    "Guyana","Haiti","Honduras","Hong Kong","Hungary",
    "Iceland","India","Indonesia","Iran","Iraq","Ireland",
    "Isle of Man","Israel","Italy","Jamaica","Japan",
    "Jersey","Jordan","Kazakhstan","Kenya","Kiribati",
    "Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia",
    "Lebanon","Lesotho","Liberia","Libya","Liechtenstein",
    "Lithuania","Luxembourg","Macau","Macedonia",
    "Madagascar","Malawi","Malaysia","Maldives","Mali",
    "Malta","Marshall Islands","Mauritania","Mauritius",
    "Mexico","Micronesia","Moldova","Monaco",
    "Mongolia","Montenegro","Montserrat","Morocco",
    "Mozambique","Myanmar","Namibia","Nauro","Nepal",
    "Netherlands","Netherlands Antilles",
    "New Caledonia","New Zealand","Nicaragua",
    "Niger","Nigeria","North Korea","Norway",
    "Oman","Pakistan","Palau","Palestine","Panama",
    "Papua New Guinea","Paraguay","Peru",
    "Philippines","Poland","Portugal",
    "Puerto Rico","Qatar","Reunion","Romania",
    "Russia","Rwanda","Saint Pierre &amp; Miquelon",
    "Samoa","San Marino","Sao Tome and Principe",
    "Saudi Arabia","Senegal","Serbia","Seychelles",
    "Sierra Leone","Singapore","Slovakia","Slovenia",
    "Solomon Islands","Somalia","South Africa",
    "South Korea","South Sudan","Spain",
    "Sri Lanka","St Kitts &amp; Nevis"
]


class Glossary(BrowserView):
    """ Glossary searcb
    """
    def __call__(self, *args, **kwargs):
        lang = self.request.get("LANGUAGE", "en")
        if len(lang) > 2:
            lang = "en"

        url = GLOSSARY.format(lang=lang)
        term = self.request.get("term", "")
        if not term:
            return self.request.response.redirect(url)

        url += SEARCH
        if isinstance(term, unicode):
            term = term.encode('utf-8')

        url += term
        self.request.response.redirect(url)

class Tags(BrowserView):
    """ Get search auto-complete tags
    """
    def __call__(self, **kwargs):
        if self.request:
            form = getattr(self.request, 'form', {})
            kwargs.update(form)
        q = kwargs.get("q", "")

        return json.dumps([x for x in DUMMY_TAGS if q in x.lower()])
