(function() {
  'use strict';

  /**
   * Generated by OS.js build system
   */
  var SETTINGS = Object.freeze((function() {
    var c = %CONFIG%;

    var rootURI = window.location.pathname || '/';
    if ( window.location.protocol === 'file:' ) {
      rootURI = window.location.href.replace(/[^\/]*$/, '');
    } else {
      if ( rootURI.substr(-1) !== '/' ) {
        rootURI = rootURI.replace(/[^\/]*$/, '');
      }
    }

    var replace = ['RootURI', 'APIURI', 'FSURI', 'MetadataURI', 'ThemeURI', 'SoundURI', 'IconURI', 'PackageURI'];
    replace.forEach(function(k) {
      var v = c.Connection[k];
      if ( typeof v !== 'undefined' ) {
        c.Connection[k] = v.replace(/^\/?/, rootURI);
      }
    });

    var preloads = c.Preloads;
    if ( preloads ) {
      preloads.forEach(function(item, key) {
        if ( item && item.src && item.src.match(/^\//) ) {
          preloads[key].src = item.src.replace(/^\//, rootURI);
        }
      });
    }

    return Object.freeze(c);
  }()));

  /**
   * Exports
   */
  window.OSjs = window.OSjs || {};
  OSjs.Core = OSjs.Core || {}
  OSjs.Core.getConfig = function() {
    return SETTINGS;
  };

})();
