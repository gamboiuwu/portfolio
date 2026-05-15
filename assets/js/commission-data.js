/*!
 * commission-data.js
 * Gallery data, font, and style manager via localStorage.
 * Used by commissions/index.html and admin/index.html.
 */
window.CommissionData = (function () {
  'use strict';

  var KEYS = {
    data:   '_gam_data_v1',
    fonts:  '_gam_fonts_v1',
    styles: '_gam_styles_v1'
  };

  var DEFAULTS = {
    data: {
      commissions: [
        { src: '../images/fullcomm/comm1.png',  alt: 'Complex full body with environment', caption: 'Complex Full Body w/ Environment' },
        { src: '../images/fullcomm/comm2.jpeg', alt: 'Complex full body',                  caption: 'Complex Full Body'               },
        { src: '../images/fullcomm/comm3.png',  alt: 'Flat headshot',                      caption: 'Flat Headshot'                   }
      ],
      stickers: [
        { src: '../images/stickers/sticker1.png', alt: 'Simple sticker 1',  category: 'Simple'  },
        { src: '../images/stickers/sticker3.png', alt: 'Simple sticker 2',  category: 'Simple'  },
        { src: '../images/stickers/sticker2.png', alt: 'Complex sticker 1', category: 'Complex' },
        { src: '../images/stickers/sticker4.png', alt: 'Complex sticker 2', category: 'Complex' },
        { src: '../images/stickers/sticker5.png', alt: 'Complex sticker 3', category: 'Complex' }
      ],
      featured: [
        {
          title: 'To Prove You Are Everything',
          tagline: 'Senior Project · 2026',
          statement: 'An interdisciplinary studio art senior thesis exploring identity, self-expression, and the tension between what is seen and what is felt.',
          src: '',
          link: '',
          images: [],
          visible: true
        }
      ]
    },
    fonts:  { heading: '', body: '', custom: [] },
    styles: { accentColor: '', customCSS: '' }
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function read(key, def) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : clone(def);
    } catch (e) {
      return clone(def);
    }
  }

  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---- Font loading ---- */

  function loadGoogleFont(name) {
    if (!name) return;
    var id = 'gf-' + name.toLowerCase().replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' +
                encodeURIComponent(name) +
                ':ital,wght@0,300;0,400;0,700;1,400&display=swap';
    document.head.appendChild(link);
  }

  /* ---- Apply persisted fonts + styles to the current page ---- */

  function applyAll() {
    var fonts  = CD.getFonts();
    var styles = CD.getStyles();
    var css    = '';

    /* Custom @font-face blocks from uploaded files */
    (fonts.custom || []).forEach(function (f) { css += f.face + '\n'; });

    /* Google Font assignments */
    if (fonts.heading) {
      loadGoogleFont(fonts.heading);
      css += 'h1,h2,h3,h4,h5,h6{font-family:"' + fonts.heading + '",sans-serif!important}';
    }
    if (fonts.body) {
      loadGoogleFont(fonts.body);
      css += 'body,p,td,li{font-family:"' + fonts.body + '",sans-serif!important}';
    }

    /* Accent color override */
    if (styles.accentColor) {
      var c = styles.accentColor;
      css += '.button.primary,.button.primary:visited{background-color:' + c + '!important;border-color:' + c + '!important}';
      css += 'a:hover{color:' + c + '!important}';
      css += '.status-badge.open{background:' + c + '22!important;border-color:' + c + '!important;color:' + c + '!important}';
    }

    /* User custom CSS */
    if (styles.customCSS) css += '\n' + styles.customCSS;

    var tag = document.getElementById('_gam_dynamic');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = '_gam_dynamic';
      document.head.appendChild(tag);
    }
    tag.textContent = css;
  }

  /* ---- Gallery renderers ---- */

  function renderCommissions() {
    var el = document.getElementById('comm-gallery-container');
    if (!el) return;
    var items = CD.get().commissions || [];
    el.innerHTML = items.map(function (it) {
      return '<figure class="comm-gallery-item">' +
        '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" />' +
        (it.caption ? '<figcaption>' + esc(it.caption) + '</figcaption>' : '') +
        '</figure>';
    }).join('');
  }

  function renderStickers() {
    var el = document.getElementById('sticker-gallery-container');
    if (!el) return;
    var items = CD.get().stickers || [];
    el.innerHTML = items.map(function (it) {
      return '<figure class="sticker-gallery-item">' +
        '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" />' +
        '</figure>';
    }).join('');
  }

  function renderFeatured() {
    var el = document.getElementById('featured-container');
    if (!el) return;
    var allItems = CD.get().featured || [];
    var items = allItems.filter(function(it){ return it.visible !== false; });
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(function (it) {
      /* find the real index so the detail page can look it up */
      var realIdx = allItems.indexOf(it);
      var detailHref = 'featured/?i=' + realIdx;
      var imgStyle  = it.src ? ' style="background-image:url(\'' + it.src.replace(/'/g, "\\'") + '\')"' : '';
      var imgClass  = it.src ? 'featured-img' : 'featured-img featured-img-empty';
      /* Stretched-link pattern: card keeps its flex layout intact;
         the <a> inside .featured-body gets a ::after that covers the whole card */
      return '<article class="featured-card">' +
        '<div class="' + imgClass + '"' + imgStyle + '></div>' +
        '<div class="featured-body">' +
          (it.tagline   ? '<span class="featured-tagline">' + esc(it.tagline) + '</span>'  : '') +
          '<h3 class="featured-title">' + esc(it.title) + '</h3>' +
          (it.statement ? '<p class="featured-statement">' + esc(it.statement) + '</p>'    : '') +
          '<a href="' + detailHref + '" class="featured-cta">Read More &rarr;</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  var CD = {
    /* Data */
    get:         function ()  { return read(KEYS.data,   DEFAULTS.data);   },
    save:        function (d) { write(KEYS.data,   d);                      },
    reset:       function ()  { localStorage.removeItem(KEYS.data);         },
    /* Fonts */
    getFonts:    function ()  { return read(KEYS.fonts,  DEFAULTS.fonts);  },
    saveFonts:   function (f) { write(KEYS.fonts,  f);                      },
    /* Styles */
    getStyles:   function ()  { return read(KEYS.styles, DEFAULTS.styles); },
    saveStyles:  function (s) { write(KEYS.styles, s);                      },
    /* Utilities */
    loadGoogleFont: loadGoogleFont,
    applyAll:       applyAll,
    renderCommissions: renderCommissions,
    renderStickers:    renderStickers,
    renderFeatured:    renderFeatured,
    esc:     esc,
    DEFAULTS: DEFAULTS
  };

  return CD;
}());
