const { Parser } = require('htmlparser2')

const special = {
  tags: {
    singleton: [
      'br',
      'hr',
      'img',
      'input',
      'meta'
    ]
  },
  attrs: {
    boolean: [
      'async',
      'checked',
      'hidden',
      'selected'
    ]
  }
}

async function htmlformat( content, opts ) {
  let output = []

  opts = Object.assign( {
    comments: true
  }, opts )

  return new Promise( resolve => {

    const parser = new Parser( {
      onprocessinginstruction( name, data ) {
        // e.g. <!doctype html>
        output.push('<' + data + '>')
      },
      onopentag( name, attributes ) {
        if (Object.keys( attributes ).length != 0)
          output.push('<' + name + ' ' + writeAttrs( attributes ) + '>')
        else
          output.push('<' + name + '>')
      },
      onclosetag( name ) {
        if (!special.tags.singleton.includes( name ))
          output.push('</' + name + '>')
      },
      ontext( data ) {
        output.push( data )
      },
      oncomment( value ) {
        if( opts.comments )
          output.push('<!--' + value + '-->')
      },
      onend() {
        resolve( output.join('') )
      }
    } )

    parser.write( content )
    parser.end()

  } )
}

function writeAttrs( attributes ) {
  let out = []

  Object.keys( attributes ).forEach( key => {
    out.push( writeAttr( key, attributes[key] ) )
  } )

  return out.join(' ')
}

function writeAttr( attr, val ) {
  return (val === '' && special.attrs.boolean.includes( attr )) ? attr : attr + `="${val}"`
}

module.exports = htmlformat
