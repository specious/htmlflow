const { Parser } = require('htmlparser2')

const { tags, attrs } = require('./lib/kinds.js')

async function htmlFlow( content, opts ) {
  opts = Object.assign( {
    indent: 2,
    tabs: false,
    formatting: true,
    comments: true
  }, opts )

  return new Promise( resolve => {

    let output = []

    let indentUnit = (opts.tabs ? '\t' : ' ').repeat( opts.indent )

    let indent = 0
    let inline = false
    let unformatted = false
    let verbatim = false
    let history = []

    function put( s ) { output.push( s ) }
    function puttag( s ) { put( '<' + s + '>' ) }
    function shift() { put( indentUnit.repeat( indent ) ) }

    const parser = new Parser( {
      onprocessinginstruction( name, data ) { // e.g. <!doctype html>
        shift()
        puttag( data )
      },
      onopentag( name, attributes ) {
        if (opts.formatting && !inline && !verbatim) {
          if (output.length !== 0)
            put( '\n' )

          if (!verbatim) {
            shift()

            if (!tags.singleton.includes( name ) &&
                !tags.verbatim.includes( name ) &&
                !tags.inline.includes( name ))
              indent++
          }
        }

        if (!tags.singleton.includes( name )) {
          history.push( { inline, unformatted, verbatim } )

          // Once inside inline tag, let's keep inlining
          inline = inline || tags.inline.includes( name )

          if (tags.unformatted.includes( name ))
            unformatted = true

          if (tags.verbatim.includes( name ))
            verbatim = true
        }

        if (Object.keys( attributes ).length != 0)
          puttag( name + ' ' + writeAttrs( attributes ) )
        else
          puttag( name )
      },
      onclosetag( name ) {
        if (tags.singleton.includes( name ))
          return

        if (opts.formatting && !inline && !verbatim) {
          indent--
          put( '\n' )
          shift()
        }

        puttag( '/' + name )

        const prevstate = history.pop()
        inline = prevstate.inline
        unformatted = prevstate.unformatted
        verbatim = prevstate.verbatim
      },
      ontext( data ) {
        if (opts.formatting) {
          let lines = data.split('\n')

          while (typeof lines[0] === 'string' && lines[0].trim() === '')
            lines.shift()

          for (let i = lines.length - 1; i > -1; i--) {
            if (typeof lines[i] === 'string' && lines[i].trim() === '')
              lines.pop()
            else
              break
          }

          // If not in an unformatted context, trim empty lines and remove duplicates
          if (!unformatted) {
            let empty = false

            for (let i = lines.length - 1; i > -1; i--) {
              let line = lines[i].trim()
              lines[i] = line

              if (line === '') {
                if (empty)
                  lines.splice(lines, 1)
                else
                  empty = true
              } else
                empty = false
            }
          }

          lines.forEach( piece => {
            if (!inline) {
              put( '\n' )

              if (!unformatted)
                shift()
            }

            put( !unformatted ? piece.trimLeft() : piece )
          } )
        } else {
          put( data )
        }
      },
      oncomment( value ) {
        if (opts.comments)
          put( '<!--' + value + '-->' )
      },
      onend() {
        resolve( output.join('') )
      }
    }, {
      recognizeSelfClosing: true
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
  return (val === '' && attrs.boolean.includes( attr )) ? attr : attr + `="${val}"`
}

module.exports = htmlFlow
