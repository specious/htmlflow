const kinds = {
  tags: {
    singleton: [
      'area',
      'base',
      'br',
      'col',
      'command',
      'embed',
      'hr',
      'img',
      'input',
      'keygen',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr'
    ],
    inline: [
      'a',
      'b',
      'br',
      'button',
      'canvas',
      'cite',
      'code',
      'data',
      'datalist',
      'em',
      'embed',
      'i',
      'iframe',
      'img',
      'input',
      'label',
      'map',
      'noscript',
      'object',
      'picture',
      'q',
      's',
      'select',
      'span',
      'strong',
      'sub',
      'sup',
      'textarea',
      'u',
      'wbr'
    ],
    embedded: [
      'script',
      'style'
    ],
    verbatim: [
      'pre'
    ]
  },
  attrs: {
    boolean: [
      'allowfullscreen',
      'allowpaymentrequest',
      'async',
      'autofocus',
      'autoplay',
      'checked',
      'controls',
      'default',
      'defer',
      'disabled',
      'formnovalidate',
      'hidden',
      'ismap',
      'itemscope',
      'loop',
      'multiple',
      'muted',
      'nomodule',
      'novalidate',
      'open',
      'playsinline',
      'readonly',
      'required',
      'reversed',
      'selected',
      'truespeed'
    ]
  }
}

module.exports = kinds
