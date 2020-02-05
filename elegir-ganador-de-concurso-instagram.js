/* eslint-disable no-var,newline-before-return */
var removeDuplicates = true

/**
 * Esta funcion deberia funcionar con cualquier post de instagram
 *   Utilízala abriendo la consola Javascript de Chrome, pegando este código completo y dándole a ENTER
 *   https://developers.google.com/web/tools/chrome-devtools/console/
 *
 * Instagram carga los comentarios en bloques. Esta funcion automaticamente hará click en el botón de "Mostrar más"
 *   Es probable que la ejecución tarde un poco, sobre todo si hay muchos comentarios
 *   Al final mostrará todos los usuarios que han comentado y elegirá a uno de forma aleatoria
 *
 *
 * Ejemplo de URL de post: https://www.instagram.com/p/B7S5q5mI0cm/
 */

var debug = false
var loadMoreButtonSelector = '[aria-label="Load more comments"]'
var loadingSvgSelector = 'article svg'
var userNameSelector = 'body > div#react-root > section > main article li h3'
var scrollContainerSelector = 'body > div#react-root > section > main article ul'

var errorStyle = 'background: red; color: white; font-size: x-large'
var infoStyle = 'background: green; color: white; font-size: x-large'
var warningStyle = 'background: green; color: white; font-size: large'
var successStyle = 'background: #ffd052; color: black; font-size: x-large'

var counter = '-'
var commentCount = 0
var prevCommentCount = 0
var loadingCount = 0
var tickCount = 0
var loadingLimitBreak = 30
var urlSinglePost = /(com\/p\/.*)/
var { log } = console
var { clear } = console

var clearConsole = () => {
  !debug ? clear() : null
}

var reset = ( name ) => {
  clearInterval( name )
  clearConsole()
}

var loadingSpinner = () => {
  counter==='-'?counter='/':counter==='/'?counter='- ':counter==='- '?counter='\\':counter==='\\'&&( counter='-' )
  log( `Comments: ${commentCount}` )
  !debug && log( `Loading... ${counter}` )
}

var interval = setInterval( () => {
  const articleLength = document.querySelectorAll( 'article' ).length
  const commentLength = document.querySelectorAll( userNameSelector ).length
  const button = document.querySelector( loadMoreButtonSelector )
  const loadingSvg = document.querySelectorAll( loadingSvgSelector )
  const testedUrlBool = urlSinglePost.test( window.location.href )
  const scrollContainer = document.querySelector( scrollContainerSelector )

  if ( debug ) {
    log({
      articleLength,
      commentLength,
      button,
      loadingSvg,
      testedUrlBool,
      scrollContainer
    })
  }

  prevCommentCount = commentLength
  scrollContainer ? scrollContainer.scrollTop = scrollContainer.scrollHeight : null
  tickCount++

  if ( testedUrlBool && articleLength > 1 ) {
    reset( interval )
    return log( '%cNavega hasta la pagina de la imagen y re-ejecuta el script.', infoStyle )
  } else if ( testedUrlBool && commentLength === 0 ) {
    reset( interval )
    return makeFunOfScriptRunner()
  } else if ( articleLength > 1 || commentLength === 0 ) {
    reset( interval )
    log( '%cEste script solo funciona en urls de imagenes.', errorStyle )
    return log( '%cPor ejemplo:\nhttps://www.instagram.com/p/B7S5q5mI0cm/', 'font-size: x-large' )
  } else if ( window.innerWidth < 736 ) {
    reset( interval )
    return log( '%cLos comentarios no se cargan con un ancho de pantalla tan pequeño. Haz la ventana más grande y prueba de nuevo.', infoStyle )
  } else if ( loadingSvg.length && loadingCount < loadingLimitBreak ) {
    loadingCount++
    clearConsole()
    loadingSpinner()
    return
  } else if ( button && prevCommentCount !== commentCount ) { // check if the new comment button is stuck
    loadingCount = 0
    tickCount = 0
    clearConsole()
    loadingSpinner() // super cool loading spinner, dont judge me
    commentCount = commentLength
    return button.click()
  } else if ( debug && tickCount <= 10 ) {
    return log( 'DEBUG', {
      tickCount: tickCount,
      loadingCount: loadingCount,
      button: Boolean( button ),
      prevCommentCount: prevCommentCount,
      commentCount: commentCount,
      'button && prevCommentCount !== commentCount': button && prevCommentCount !== commentCount
    })
  } else {
    reset( interval )
    return isolateUsernames( [ ...document.querySelectorAll( userNameSelector ) ] )
  }
}, 250 )

var isolateUsernames = ( peopleList ) => {
  let userNames = []
  peopleList.map( x => {
    if ( x.innerText !== document.querySelector( 'h2 a' ).innerText ) {
      userNames.push( x.innerText )
    }
  })
  if ( removeDuplicates ) {
    const uniqueList = [ ...new Set( userNames ) ]
    return uniqueList.length ? showPeopleAndPickWinner( uniqueList, userNames.length ) : makeFunOfScriptRunner()
  } else {
    return userNames.length ? showPeopleAndPickWinner( userNames, userNames.length ) : makeFunOfScriptRunner()
  }
}

var randVideo = () => {

  const items = [
    'https://youtu.be/31j4DIpgY9U', // ghostmane mercury
    'https://youtu.be/vXXHISsnQl4', // lary's barleywine
    'https://youtu.be/kCaf9rWYmAg', // bilmuri there
    'https://youtu.be/CEVXcP3VC3Y', // tyler igors theme
    'https://youtu.be/9AXXSa8YEic', // the decline (live)
    'https://youtu.be/LYWpFs8Na9k', // badcop+badcop womanarchist
    'https://youtu.be/urt88eX5yXo?t=1859', // earth crisis (live)
    'https://youtu.be/bN0ciI2Fibo?t=505' // earth crisis (punk rock mba)
  ]
  return items[~~( items.length * Math.random() )]
}

var makeFunOfScriptRunner = () => {
  log( '%cSeriously?', errorStyle )
  log( '%cThere are clearly no comments.', errorStyle )
  return log( `%c${randVideo()}`, 'font-size: x-large' )
}

// display all people and pick a winner!!
var showPeopleAndPickWinner = (people, totalComments) => {
  // show all people and pick the winner! 
  const num = people.length
  const WINNER = people[Math.floor( Math.random()*num )]
  const button = document.querySelector( loadMoreButtonSelector )
  const loadingSvg = document.querySelectorAll( loadingSvgSelector )
  reset( interval )
  loadingCount >= loadingLimitBreak && log( '%cError: comments stopped loading properly, please review results.\n\nYou can most likely just paste the code again WITHOUT reloading.', errorStyle )
  Boolean( button || loadingSvg.length ) && log( '%cWarning: button to load more comments is still visible. This is probably because of a bug where IG enters an inescapable infinite loop by loading the same comments over and over.\n\nRegardless, run the script again just to make sure (WITHOUT reloading).\n\nIf nothing changes or if it loads comments you\'ve seen before, use the winner output below.', warningStyle )
  for (var i = 0; i < people.length; i++) {
    log(people[i]);
  }
  log( `${totalComments} comentarios totales (excluyendo respuestas, incluyendo duplicados)` )
  log( removeDuplicates ? `Eliminados ${totalComments - people.length} los comentarios duplicados` : 'duplicates not removed' )
  log( `%cY el elegido (por un método aleatorio) de un total de ${num} ${num === 1 ? 'entrada' : 'entradas'} es...\n\n${WINNER.toUpperCase()} !!!!`, successStyle )
  log( `%chttps://www.instagram.com/${WINNER}/`, 'font-size: large' )
}