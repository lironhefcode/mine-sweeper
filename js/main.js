var gBoard
 var gLevel = { 
    SIZE: 4, 
    MINES: 2 
}
var gGame


function init(){
     gGame = { 
        lives: 4, // actualy is 3 get reduced by 1 when rendering 
        isOn: true, 
        shownCount: 0, 
        markedCount: 0, 
        secsPassed: 0,
        firstClick:true    
    } 
    gBoard = createBoard()
   
   
    renderBoard(gBoard)
   
}



function createBoard(){
    var board = []
    for(var i =0;i<gLevel.SIZE;i++){
        board[i] = []
        for(var j=0;j<gLevel.SIZE;j++){
            var cell =  {minesAroundCount: 0, 
            isShown: false, 
            isMine: false, 
            isMarked: false
            }
            board[i][j] = cell
        }
    }
 

   
    return board
}

function renderBoard(board){
     

        const elBoard = document.querySelector('.board')
        var strHTML = ''
    
        for (var i = 0; i < board.length; i++) {
            strHTML += '<tr>\n'
            for (var j = 0; j < board[0].length; j++) {
                const currCell = board[i][j]
               
              
                     
    
                // strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n'
                strHTML += `\t<td class="cell " data-i="${i}" data-j="${j}" onclick=onCellClicked(this,${i},${j}) oncontextmenu="onCellMarked(this,${i},${j})" >`
    
                strHTML += '</td>\n'
            }
            strHTML += '</tr>\n'
        }
        elBoard.innerHTML = strHTML
}






function setMinesNegsCount(board){
    for(var i =0;i<board.length;i++){
        for(var j=0;j<board[i].length;j++){
            var cell = board[i][j]
            calculateNeighbors(cell,{i,j},board)
        }
    }
}


function calculateNeighbors(cell,pos,board){
    if(cell.isMine) return
    for(var i = pos.i-1;i<=pos.i+1;i++){
        for(var j=pos.j-1;j<=pos.j+1;j++){
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue
            
			if (board[i][j].isMine ) cell.minesAroundCount++
        }
    }

}
function onCellClicked(elCell, i, j){
    if(!gGame.isOn) return
    if (gGame.firstClick){
        
        firstClick({i,j})
    }
    if(gBoard[i][j].isShown) return
    gGame.shownCount += 1
    gBoard[i][j].isShown = true
    if(gBoard[i][j].isMine){
        gBoard[i][j].isShown = false
        elCell.innerHTML = '💣' 
        mineClicked()
        return
    } else if(gBoard[i][j].minesAroundCount === 0)
        {
            expandShown(gBoard,elCell,{i,j})
            if(gBoard[i][j].isMarked){
                gGame.markedCount--
                elCell.innerHTML =  gBoard[i][j].minesAroundCount
              }

        } else if(gBoard[i][j].isMarked){
            gGame.markedCount--
            elCell.innerHTML =  gBoard[i][j].minesAroundCount
          }else elCell.innerHTML =  gBoard[i][j].minesAroundCount
        elCell.className = "cell show"
        checkGameOver()
      
    

}

function onCellMarked(elCell,i,j){
    if(!gGame.isOn) return
    if(gBoard[i][j].isShown && !gBoard[i][j].isMine ) return
    if(gBoard[i][j].isMarked){
        elCell.innerHTML = ''
        gBoard[i][j].isMarked = false
        if(gBoard[i][j].isShown) gGame.shownCount--
        gGame.markedCount--
    } else{
        elCell.innerHTML = '🚩'
        gBoard[i][j].isMarked = true
        if(gBoard[i][j].isShown) gGame.shownCount--
        gGame.markedCount++
        checkGameOver()
    }

}



function ranMines(numOfMines,notMine){
   
    var cells = []
    for(var i =0;i<gBoard.length;i++){
        for(var j=0;j<gBoard[0].length;j++){
            if (i===notMine.i&&j===notMine.j) continue
            cells.push({i,j})
        }
    }
    for( var i=0;i<numOfMines;i++){
        var num = getRandom(0,cells.length-1)
        gBoard[cells[num].i][cells[num].j].isMine = true
        cells.splice(num,1)
    }

    setMinesNegsCount(gBoard)

}


function checkGameOver(){
    
    if(gGame.markedCount===(gLevel.MINES)&&gGame.shownCount===((gLevel.SIZE**2)-gLevel.MINES)){
        
       console.log('aaaa')
       var elRestart = document.querySelector('.restart')
        elRestart.innerHTML = '🏆'
        gGame.isOn = false  
       
    }
}


function expandShown(board, elCell, pos){
   elCell.innerHTML = ''
    for(var i = pos.i-1;i<=pos.i+1;i++){
        for(var j=pos.j-1;j<=pos.j+1;j++){
            if (i < 0 || i >= gLevel.SIZE || j < 0 || j >= gLevel.SIZE) continue
            
			if (!board[i][j].isMine && !board[i][j].isShown) onCellClicked(document.querySelector(`[data-i="${i}"][data-j="${j}"]`),i,j)
        }
    }

}
 function firstClick(notMine){
    ranMines(gLevel.MINES,notMine)
    gGame.firstClick = false
    console.log('check')

 }
function mineClicked(){
    var elLives = document.querySelector('.lives')
    
    var strHTML= ''
    gGame.lives--
    for(var i=0;i<gGame.lives;i++){
        strHTML += '❤️'
    }
    elLives.innerHTML = strHTML
    
    if(gGame.lives===0){
        var elRestart = document.querySelector('.restart')
        elRestart.innerHTML = '😔'
        gGame.isOn = false
    }
    
}

function restart(){
     var elRestart = document.querySelector('.restart')
        elRestart.innerHTML = '😀'
    init()
}

function getRandom(min, max) {
	return Math.floor(Math.random() * max) + min;
}



function changeSize(elButton){
    gLevel.MINES = +elButton.dataset.mines
    gLevel.SIZE = +elButton.dataset.size
    restart()
}