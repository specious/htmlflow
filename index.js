const { Parser } = require('htmlparser2')

const { tags, attrs } = require('./lib/kinds.js')

async function htmlFlow( content, opts ) {
  opts = Object.assign( {
    indent: 2,        // How many tabs or spaces to indent
    tabs: false,      // Indenting with tabs or spaces?
    spacesPerTab: 4,  // How many spaces is a tab assumed to equal (used when tabs and spaces are mixed in embedded content)
    formatting: true, // Turn on formatting or compress everything into an unformatted bundle
    comments: true    // Include comments?
  }, opts )

  return new Promise( resolve => {

    let output = []

    let indentUnit = (opts.tabs ? '\t' : ' ').repeat( opts.indent )

    let indents = 0
    let inline = false
    let embedded = false
    let verbatim = false
    let prevElem = {}
    let history = []

    function put( s ) { output.push( s ) }
    function puttag( s ) { put( '<' + s + '>' ) }
    function putlines( lines ) { output.push( ...lines ) }
    function shift() { put( indentUnit.repeat( indents ) ) }

    const parser = new Parser( {
      //
      // On processing instruction tag e.g. <!doctype html>
      //
      onprocessinginstruction( name, data ) {
        puttag( data )
      },

      //
      // On opening tag, e.g. <div id="main">
      //
      onopentag( name, attributes ) {
        if (!verbatim) {
          if (opts.formatting && !inline) {
            // Create a new line unless opening an inline tag after significant text or another inline tag has closed
            if (!(tags.inline.includes( name ) && (prevElem.type === "text" || tags.inline.includes( prevElem.name )))) {
              if (output.length !== 0)
                put( '\n' )

              shift()
            }

            if (!tags.singleton.includes( name ) &&
                !tags.verbatim.includes( name ) &&
                !tags.inline.includes( name ))
              indents++
          }

          // Add trailing space from previous text element if formatting elements inline with text
          if (prevElem.trailingSpace && (inline || tags.inline.includes( name )))
            put( ' ' )
        }

        if (!tags.singleton.includes( name )) {
          history.push( { inline, embedded, verbatim } )

          // Treat everything as inline once inside an inline tag
          inline = inline || tags.inline.includes( name )

          if (tags.embedded.includes( name ))
            embedded = true

          if (tags.verbatim.includes( name ))
            verbatim = true
        }

        if (Object.keys( attributes ).length != 0)
          puttag( name + ' ' + writeAttrs( attributes ) )
        else
          puttag( name )

        prevElem = {
          type: "tag",
          name
        }
      },

      //
      // On closing tag, e.g. </div>
      //
      // This is also called right after a singleton tag (e.g. <br>) has appeared
      //
      onclosetag( name ) {
        if (!tags.singleton.includes( name )) {
          if (opts.formatting && !inline && !verbatim) {
            indents--

            // If a tag is immediately closed with no inner content, close it on the same line
            if (prevElem.type !== "tag" || prevElem.name !== name) {
              put( '\n' )
              shift()
            }
          }

          puttag( '/' + name )

          ;( { inline, embedded, verbatim } = history.pop() )
        }

        prevElem = {
          type: "closetag",
          name
        }
      },

      //
      // On text section
      //
      ontext( data ) {
        if (!verbatim && !embedded) {
          // Trim trailing whitespace
          let rightTrimmed = data.replace(/\s+$/, '')

          // Remember whether trailing whitespace was present
          let trailingSpace = (rightTrimmed.length !== data.length)

          // Is there any non-whitespace content
          let hasContent = (rightTrimmed.length !== 0)

          let stayInline = inline || tags.inline.includes( prevElem.name )

          if (hasContent) {
            // Trim whitespace from left
            data = rightTrimmed.replace(/^\s+/, '')

            // Add leading space if leading whitespace was removed
            if (stayInline && data.length !== rightTrimmed.length)
              data = ' ' + data

            // Reformat whitespace to simple spaces inside the content
            data = data.replace(/\s+/g, ' ')

            if (opts.formatting && !stayInline) {
              put( '\n' )
              shift()
            }

            put( data )
          }

          // Remember this text section only if it has enduring significance
          if (hasContent || stayInline) {
            prevElem = {
              type: 'text',
              trailingSpace
            }
          }
        } else {
          if (verbatim) {
            put( data )
          } else if(!/^\s*$/.test(data)) {
            // Strip leading and trailing empty lines
            data = data.replace(/^(\s*\n)+/, '').replace(/(\n\s*)+$/, '') 

            if (opts.formatting)
              put( '\n' )

            // Make an effort to correctly indent inner content
            putlines( formatEmbeddedContent( data.split( '\n' ) ) )

            prevElem = {
              type: 'text'
            }
          }
        }
      },

      //
      // On HTML comment
      //
      oncomment( value ) {
        if (opts.comments)
          put( '<!--' + value + '-->' )
      },

      //
      // End of document
      //
      onend() {
        resolve( output.join('') )
      }
    }, {
      recognizeSelfClosing: true
    } )

    parser.write( content )
    parser.end()

    //
    // -- functions: tag attributes
    //

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

    //
    // -- functions: embedded content formatting
    //

    function formatEmbeddedContent( lines ) {
      let spacesToRemove = Infinity

      for (let i = 0; i < lines.length; i++) {
        // Trim whitespace from the right (which should completely clear empty lines)
        let line = lines[i] = lines[i].replace(/\s+$/, '')

        // Find or establish the indentation of the least indented content
        spacesToRemove = Math.min( spacesToRemove, countIndentSpaces( line ) )
      }

      for (let i = 0; i < lines.length; i++)
        lines[i] = reindentLine( lines[i], spacesToRemove, indentUnit.repeat( indents ) ) + ((i === lines.length - 1) ? '' : '\n')

      return lines
    }

    function countIndentSpaces( line ) {
      let count = 0

      // For simplicity and uniformity, assess original indentation in terms of spaces
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ')
          count++
        else if (line[i] === '\t')
          count += opts.spacesPerTab
        else
          return count
      }

      // Must be an empty line, so make sure it doesn't count toward finding the least indented content
      return Infinity
    }

    function reindentLine( line, removeSpaces, newIndent ) {
      let count, idx

      if (line.length !== 0) {
        // Attempt to identify how many characters to remove
        for (idx = 0, count = 0; count < removeSpaces; idx++) {
          count += (line[idx] === ' ') ? 1 : opts.spacesPerTab
        }

        // If we have overrun the exact number of spaces to remove due to a tab, add the remaining spaces to the new indent
        if (count > removeSpaces) {
          newIndent += ' '.repeat( count - removeSpaces )
        }

        // Replace old indentation with new indentation
        return newIndent + line.slice(idx)
      } else
        return line
    }

  } )
}

module.exports = htmlFlow
