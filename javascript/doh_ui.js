// Copyright (c) 2012 Jake Willoughby
// 
// This file is part of DOH.
// 
// DOH is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
// 
// DOH is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with DOH.  See gpl3.txt. If not, see <http://www.gnu.org/licenses/>.


// Requires jquery.

var DOH_UI = new function() {
  var master = "";
  var masterHash = "";
  var salt = "";
  var host = "";
  this.domainSpecs = "";
  var dohHashFunction = "sha256";
  var selectedHasher = DOH.gen_password;
  var selectedHasherIsSecure = false;

  this.init = function(domain_info) {
    if (domain_info) {
      this.domainSpecs = domain_info;
    }
    else {
      $.getJSON('domain_specs.json', function (data) {
        DOH_UI.domainSpecs = data;
      });
    }
  };

  var hostSource = function() {
  };

  var getHost = function() {
    return host;
  };

  var getSalt = function() {
    return salt;
  };

  this.getPassword = function() {
    var host = getHost();
    var opts = {'domain': host, 
      'salt': getSalt(),
      'hashedMaster': masterHash,
      'seq': "0", 
      'hashFunction': dohHashFunction};
    if (!selectedHasherIsSecure) {
      opts['password'] = master;
    }
    if (host) {
      return selectedHasher(opts);
    }
    return "Invalid domain string.";
  };
  this.setMaster = function(password) {
    if (!selectedHasherIsSecure) {
      master = password;
    }
    masterHash = Crypto.util.bytesToBase64(Crypto.SHA256(getSalt() + password, {asBytes: true}));
  };

  this.setHasher = function(hasherString) {
    var h = hasherString;
    selectedHasherIsSecure = true;
    if (h == "DOHsha1") {
      selectedHasher = DOH.gen_password;
      dohHashFunction = "sha1";
    }
    else if (h == "DOHsha256") {
      selectedHasher = DOH.gen_password;
      dohHashFunction = "sha256";
    }
    else if (h == "INSECUREmd5hash") {
      selectedHasher = INSECURE.md5hash;
      selectedHasherIsSecure = false;
    }
  };
  
  this.setSalt = function(s) {
    salt = s;
  };
  this.setHost = function(h) {
    var match = h.match(/([-A-Za-z0-9]+\.)*([-A-Za-z0-9]*\.[-A-Za-z0-9]+)/);
    if (match && 2 in match) {
      host = match[2];
    }
    else {
      host = null;
    }
  };
};
