var gBoard

var gLevel = {
    SIZE: 4,

    MINES: 2
}

var gGame

var gtimer
const LIGHTBULB = '💡'
const CROSS = '❌'
var darkMode = false
function init() {
   
    gMoves = 
    gGame = {
        lives: 3, 
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstClick: true,
        hintMode: false,
        hints: 3,
        safeClicks: 3,
        exterminatorUsed: false,
        megaClick : 2,
        megaHint : false,
        megaCells : [],
        customMode: false,
        minePlaced:0

    }
    gBoard = createBoard()


    renderBoard(gBoard)
    mineClicked()
    renderHints()
    time()
    upadteSafe()
    updateMines()

}



function createBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isSafe: false
            }
            board[i][j] = cell
        }
    }



    return board
}

function renderBoard(board) {


    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {




            if(board[i][j].isShown){
                if(board[i][j].minesAroundCount===0)
                strHTML += `\t <td class="cell show" data-i="${i}" data-j="${j}" onclick=onCellClicked(this,${i},${j}) oncontextmenu="onCellMarked(this,${i},${j})" >`
                else{
                     strHTML += `\t <td class="cell show" data-i="${i}" data-j="${j}" onclick=onCellClicked(this,${i},${j}) oncontextmenu="onCellMarked(this,${i},${j})" > ${board[i][j].minesAroundCount}`
                }
               
            }else if(board[i][j].isMarked){
                strHTML += `\t <td class="cell " data-i="${i}" data-j="${j}" onclick=onCellClicked(this,${i},${j}) oncontextmenu="onCellMarked(this,${i},${j})" >🚩`
            }else{
                strHTML += `\t <td class="cell " data-i="${i}" data-j="${j}" onclick=onCellClicked(this,${i},${j}) oncontextmenu="onCellMarked(this,${i},${j})" >`
            
            }
            

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}






function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            calculateNeighbors(cell, { i, j }, board)
        }
    }
}


function calculateNeighbors(cell, pos, board) {
    if (cell.isMine) return
    cell.minesAroundCount =0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue

            if (board[i][j].isMine) cell.minesAroundCount++
        }
    }

}
function onCellClicked(elCell, i, j) {
    if(gGame.customMode){
      placeMine(i,j,elCell)
        return
    }
    if (gGame.firstClick) {
        gGame.isOn = true
        firstClick({ i, j })
    }
    if (!gGame.isOn) return
   
    if(gGame.megaHint){
        
        if(gGame.megaClick>0){
            gGame.megaCells.push({i,j})
            gGame.megaClick--
        }
        if(gGame.megaCells.length===2){
            megaHint(gGame.megaCells[0],gGame.megaCells[1],gBoard)
        }
        return
    }

    if (gGame.hintMode) {

        reveal({ i, j }, gBoard)
        renderHints()
        return
    }
    if (gBoard[i][j].isSafe) {
        gGame.safeClicks--
        upadteSafe()
    }
    if (gBoard[i][j].isShown) return
    gGame.shownCount++
    gBoard[i][j].isShown = true
    if (gBoard[i][j].isMine) {
        gGame.shownCount--
        gBoard[i][j].isShown = false
        elCell.innerHTML = '💣'
        if (gBoard[i][j].isSafe) return
        mineClicked()
        return
    } else if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, { i, j })
        if (gBoard[i][j].isMarked) {
            gGame.markedCount--
            elCell.innerHTML = gBoard[i][j].minesAroundCount
        }

    } else if (gBoard[i][j].isMarked) {
        gGame.markedCount--
        elCell.innerHTML = gBoard[i][j].minesAroundCount
    } else elCell.innerHTML = gBoard[i][j].minesAroundCount
    elCell.className = "cell show"
    checkGameOver()



}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown && !gBoard[i][j].isMine) return
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = ''
        gBoard[i][j].isMarked = false
        if (gBoard[i][j].isShown) gGame.shownCount--
        gGame.markedCount--
    } else {
        elCell.innerHTML = '🚩'
        gBoard[i][j].isMarked = true
        if (gBoard[i][j].isShown) gGame.shownCount--
        gGame.markedCount++
        checkGameOver()
    }

}



function ranMines(numOfMines, notMine) {

    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (i === notMine.i && j === notMine.j) continue
            cells.push({ i, j })
        }
    }
    for (var i = 0; i < numOfMines; i++) {
        var num = getRandom(0, cells.length)
        gBoard[cells[num].i][cells[num].j].isMine = true
        cells.splice(num, 1)
    }

    setMinesNegsCount(gBoard)

}


function checkGameOver() {

    if (gGame.markedCount === (gLevel.MINES) && gGame.shownCount === ((gLevel.SIZE ** 2) - gLevel.MINES)) {

        console.log('aaaa')
        var elRestart = document.querySelector('.restart')
        elRestart.innerHTML = '🏆'
        gGame.isOn = false
        clearInterval(gtimer)
        var elWinner = document.querySelector('.winner-name')
        var elTable =  document.querySelector('table')
        elTable.style.opacity = 0
        elWinner.style.opacity =1
        elWinner.style.display = 'block'
    }
}


function expandShown(board, elCell, pos) {
    elCell.innerHTML = ''
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue

            if (!board[i][j].isMine && !board[i][j].isShown) onCellClicked(document.querySelector(`[data-i="${i}"][data-j="${j}"]`), i, j)
        }
    }

}
function firstClick(notMine) {
    gtimer = setInterval(time, 1000)
    ranMines(gLevel.MINES, notMine)
    gGame.firstClick = false
    console.log('check')

}
function mineClicked() {

    var elLives = document.querySelector('.lives')

    var strHTML = ''
    if(gGame.isOn)gGame.lives--
    
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += '❤️'
    }
    elLives.innerHTML = strHTML

    if (gGame.lives === 0) {
        var elRestart = document.querySelector('.restart')
        elRestart.innerHTML = '😔'
        gGame.isOn = false
        clearInterval(gtimer)
    }

}

function restart() {
    var elRestart = document.querySelector('.restart')
    elRestart.innerHTML = '😀'
    if(gGame.exterminatorUsed) gLevel.MINES += 2
    clearInterval(gtimer)
    init()
}

function getRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
}



function changeSize(elButton) {
    gLevel.MINES = +elButton.dataset.mines
    gLevel.SIZE = +elButton.dataset.size
    restart()
}


function hint() {
    if (gGame.hints < 1) return
    gGame.hintMode = true
}


function reveal(pos, board) {
    gGame.hints--
    gGame.hintMode = false
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue

            if (!board[i][j].isShown) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (board[i][j].isMine) {
                    elCell.innerHTML = '💣'
                } else if (board[i][j].minesAroundCount !== 0) {
                    elCell.innerHTML = board[i][j].minesAroundCount
                } else elCell.innerHTML = ''
            }
        }
    }
    setTimeout(hide, 1000, pos, board)
}

function hide(pos, board) {

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue

            if (!board[i][j].isShown) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.innerHTML = ''
            }
        }
    }
}

function renderHints() {
    var elHints = document.querySelector('.hint')
    strHTML = ''
    for (var i = 0; i < 3; i++) {
        if (i < gGame.hints) {
            strHTML += LIGHTBULB
        } else strHTML += CROSS
    }
    elHints.innerHTML = strHTML
}

function time() {

    var eltimer = document.querySelector('.timer')
    eltimer.innerHTML = gGame.secsPassed
    gGame.secsPassed++

}

function safeClick() {
    if (gGame.safeClicks < 1) return
    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isShown) {
                cells.push({ i, j })
            }
        }
    }
    var num = getRandom(0, cells.length)
    gBoard[cells[num].i][cells[num].j].isSafe = true
    var elSafeCell = document.querySelector(`[data-i="${cells[num].i}"][data-j="${cells[num].j}"]`)
    elSafeCell.style.backgroundColor = 'gold'
    setTimeout(clearSafe, 2000, elSafeCell, gBoard[cells[num].i][cells[num].j])
}

function clearSafe(elSafe, safecell) {
    var r = document.querySelector(':root')
    var rs = getComputedStyle(r)
    if (safecell.isShown) elSafe.style.backgroundColor = rs.getPropertyValue('--show')
    else elSafe.style.backgroundColor = rs.getPropertyValue('--cell')
    safecell.isSafe = false
}



function upadteSafe() {
    var elSafe = document.querySelector('.safe-click')
    elSafe.innerHTML = 'safe click <br> left: ' + gGame.safeClicks
}

function modeDark(){
    
    var elRoot = document.querySelector(':root');
    if(!darkMode){
        elRoot.style.setProperty('--body','#121212')
        elRoot.style.setProperty('--cell','#524f4f')
        elRoot.style.setProperty('--show','#333333')
        elRoot.style.setProperty('--buttons','#333333') 
        elRoot.style.setProperty('--textColor','white')
        darkMode = true

    }else{
        elRoot.style.setProperty('--body','#FFE4C4')
    elRoot.style.setProperty('--cell','gray')
    elRoot.style.setProperty('--show','#DCDCDC')
    elRoot.style.setProperty('--buttons','#FFF8DC') 
    elRoot.style.setProperty('--textColor','black')
    darkMode = false
    }
    
}




function exterminator(){
    if(gLevel.SIZE===4) return
    if(gGame.exterminatorUsed) return
    gGame.exterminatorUsed = true
 var mines = []
    
    for(var i =0;i<gBoard.length;i++){
        for(var j=0;j<gBoard[i].length;j++){
            if(gBoard[i][j].isMine) mines.push({i,j})
        }
    }
    for(var i =0;i<3;i++){
        
        var num = getRandom(0,mines.length)
        gBoard[mines[num].i][mines[num].j].isMine = false
        mines.splice(num,1)
    }
    gLevel.MINES -= 3
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function activeMegaHint(){
    if(gGame.megaClick) return
    gGame.megaHint = true
}


function megaHint(pos1,pos2,board){
    
var startI 
var endI
var startJ 
var endJ 
    if(pos1.i<pos2.i){
        startI=pos1.i
        endI=pos2.i
    }else{
        startI=pos2.i
        endI=pos1.i
    }

    if(pos1.j<pos2.j){
        startJ=pos1.j
        endJ=pos2.j
    }else{
        startJ=pos2.j
        endJ=pos1.j
    }

    for (var i = startI; i <= endI; i++) {
        for (var j = startJ; j <= endJ; j++) {
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue
            if (!board[i][j].isShown) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (board[i][j].isMine) {
                    elCell.innerHTML = '💣'
                } else if (board[i][j].minesAroundCount !== 0) {
                    elCell.innerHTML = board[i][j].minesAroundCount
                } else elCell.innerHTML = ''
            }
        }
    }
    gGame.megaHint = false
    setTimeout(renderBoard,2000,gBoard)

}

function customBoard(){
    if(gGame.isOn) return
    gGame.customMode = true
}

function placeMine(i,j,elCell){
    if(gBoard[i][j].isMine) return
    var elplaced = document.querySelector('.custom-board')
    gGame.minePlaced++
    
    gBoard[i][j].isMine = true
    elCell.innerHTML = '💣'
    elplaced.innerHTML = 'place mines: <br> left: ' + (gLevel.MINES - gGame.minePlaced)
    
    if(gGame.minePlaced === gLevel.MINES){
        gGame.customMode = false
        gGame.firstClick = false
        gGame.isOn = true
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)

    }
}


function updateMines(){
    var elplaced = document.querySelector('.custom-board')
    if(gGame.customBoard){
        elplaced.innerHTML = 'place mines: <br> left: ' + (gLevel.MINES - gGame.minePlaced)
    } else elplaced.innerHTML = 'custom Board'
}




function addScore(){

    var nameValue  = document.querySelector('.input').value
    var userInfo = {
        name:nameValue,
        level:gLevel.SIZE,
        time:gGame.secsPassed
    }
    localStorage.setItem(localStorage.length,JSON.stringify(userInfo))
    var elWinner = document.querySelector('.winner-name')
    var elTable =  document.querySelector('table')
    elTable.style.opacity = 1
    elWinner.style.opacity =
    elWinner.style.display = 'none'
    document.querySelector('input').value = '' 
}

function scoreBoard(){
    
    var topIn16 = []
    var topIn64 = []
    var topIn144 = []
    for(var i=0;i<localStorage.length;i++){
        var player  = JSON.parse(localStorage.getItem(`${i}`))
        
        if(player.level ===4){
            if(topIn16.length<3){
                topIn16.push(player)
            }else{
                for(var j=0;j<3;j++){
                    if(player.time<topIn16[j].time){
                        topIn16.splice(j,1)
                        topIn16.push(player)
                    }
                }
            }

        }
         else if(player.level ===8){
            if(topIn64.length<3){
                topIn64.push({name:player.name,time:player.time})
            }else{
                for(var j=0;j<3;j++){
                    if(player.time<topIn64[j].time){
                        topIn64.splice(j,1)
                        topIn64.push(player)
                    }
                }

            }
            
        }else if(player.level ===12){
            if(topIn144.length<3){
                topIn144.push({name:player.name,time:player.time})
            }else{
                for(var j=0;j<3;j++){
                    if(player.time<topIn144[j].time){
                        topIn144.splice(j,1)
                        topIn144.push(player)
                    }
            }

        }
    }

    }

    renderScoreBoard(topIn16,topIn64,topIn144)
}


function renderScoreBoard(top16,top64,top144){
    var elScoreBoard =  document.querySelector('.score-board')
    if(elScoreBoard.style.display==='block'){
        elScoreBoard.style.display = 'none'
        return
    }
    elScoreBoard.style.display='block'
   var strHTML = '<h2><16/h2>\n'
    var strRow16 = ''
    var strRow64 = ''
    var strRow144 = ''
   for(var i=0;i<3;i++){
    strRow16 += `player: ${top16[i].name} score: ${top16[i].time} <br> `
    strRow64 += `player: ${top64[i].name} score: ${top64[i].time} <br>`
    strRow144 += `player: ${top144[i].name} score: ${top144[i].time} <br>`
   }
   strHTML = '<h2>16</h2>\n' + strRow16 + '<h2>64</h2>\n'+ strRow64 +'<h2>144</h2>\n'+ strRow144
 
   elScoreBoard.innerHTML = strHTML

}

