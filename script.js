class Color {
    static white = 'wh';
    static black = 'bl';
}

class Piece {
    /**
     * Creates a new piece.
     * @constructor
     * @param  {string} color  Color of the piece. 'wh' or 'bl'.
     * @param  {string} type  Type of the piece. 'k', 'q', 'r', 'b', 'n', or 'p'.
     * @param  {number} lastMove  
     * The number of total moves on the board when the moving of piece was done. 0 means it hasn't moved.
     */
    constructor(color, type, lastMove = 0) {
        this.color = color;
        this.type = type;
        this.lastMove = lastMove;
        this.pawnMoveTwoCells = false;
    }
}

class Coord {
    /**
     * @param  {number} r
     * @param  {number} c
     */
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }
    isEqual(coord) {
        return this.r == coord.r && this.c == coord.c;
    }
    isValid() {
        return this.r >= 0 && this.r < 8 && this.c >= 0 && this.c < 8;
    }
    getRowInChar() {
        return (this.r + 9).toString(36).toUpperCase();
    }
    getNotation() {
        return this.getRowInChar() + this.c.toString();
    }
    toSquareNum() {
        return 'square-' + this.r.toString() + this.c.toString();
    }
    static isCoordValid(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }
    /**
     * @param  {string} squareNum
     */
    static squareNumToCoord(squareNum) {
        return new Coord(parseInt(squareNum[7]), parseInt(squareNum[8]));
    }
}

class Move {
    /**
     * @param  {Coord} startCoord
     * @param  {Coord} endCoord
     * @param  {number} halfMoveNumber
     * @param  {Array<Array<Piece>>} boardBeforeMove
     */
    constructor(startCoord, endCoord, halfMoveNumber, boardBeforeMove) {
        this.startCoord = startCoord;
        this.endCoord = endCoord;
        this.halfMoveNumber = halfMoveNumber;

        this.movingPiece = boardBeforeMove[startCoord.r][startCoord.c];
        this.capturedPiece = boardBeforeMove[endCoord.r][endCoord.c];
        this.setNotation(boardBeforeMove);
    }
    setNotation(boardBeforeMove) {
        this.notation = '';
        if(this.movingPiece.type != 'p') {
            this.notation += this.movingPiece.type.toUpperCase();
        }
        //start coord if required
        //
        //
        if(this.capturedPiece != null) {
            this.notation += 'x';
        }
        this.notation += this.endCoord.getNotation();
    }
    updateNotation(isCheck, isCheckmate) {
        if(isCheckmate) {
            this.notation += '#';
        } else if(isCheck) {
            this.notation += '+';
        }
        return this.notation;
    }
    updateInfo(boardAfterMove) {
        // called after real move

        // detect check, checkmate
        // update notation (check or checkmate)
    }
}

class MoveCastling extends Move {
    constructor(startCoord, endCoord, halfMoveNumber, board) {
        if(endCoord.r == 6) {
            this.side = 'k';
            //this.additionalMove = new Move()
        } else {
            this.side = 'q';
        }
        super(startCoord, endCoord, halfMoveNumber, board);
    }
    setNotation(boardBeforeMove) {
        if(this.side == 'k') {
            this.notation = 'O-O';
        } else {
            this.notation = 'O-O-O';
        }
    }
}

class MoveEnPassant extends Move {
    
}

class MovePromotion extends Move {

}

class MoveCode {
    static GENERAL = 0;
    static KING_SIDE_CASTLING = 10;
    static QUEEN_SIDE_CASTLING = 11;
    static EN_PASSANT = 20;
    static PROMOTION_SELECTION = 30;
    static PROMOTION_QUEEN = 31;
    static PROMOTION_ROOK = 32;
    static PROMOTION_BISHOP = 33;
    static PROMOTION_KNIGHT = 34;
}

class ChessLogic {
    constructor() {
        /** @type {Array<Array<Piece>>} */
        this.board = new Array();
        this.clearBoard();
        this.halfMoveCount = 0;
    }
    clearBoard() {
        this.board = new Array();
        for (let i = 0; i < 8; i++) {
            let r = new Array(8);
            r.fill(null);
            this.board.push(r);
        }
    }
    getPiece(coord) {
        return this.board[coord.r][coord.c];
    }
    createPiece(color, type, row, col) {
        this.removePiece(row, col);
        let piece = new Piece(color, type, this.halfMoveCount);
        this.board[row][col] = piece;
    }
    removePiece(row, col) {
        if (this.board[row][col] != null) {
            let piece = this.board[row][col];
            this.board[row][col] = null;
            return piece;
        } else return null;
    }
    /**
     * @param  {Move} move
     */
    movePiece(move) {
        this.board[move.endCoord.r][move.endCoord.c] = move.movingPiece;
        this.board[move.startCoord.r][move.startCoord.c] = null;
        this.halfMoveCount++;
        move.movingPiece.lastMove = this.halfMoveCount;
        if(move.movingPiece.type == 'p') {
            if(Math.abs(oldCol - newCol) == 2) {
                move.movingPiece.pawnMoveTwoCells = true;
            } else move.movingPiece.pawnMoveTwoCells = false;
        }
    }
    // movePiece(oldRow, oldCol, newRow, newCol) {
    //     let capturedPiece = this.removePiece(newRow, newCol);
    //     let piece = this.board[oldRow][oldCol];
    //     this.board[newRow][newCol] = piece;
    //     this.board[oldRow][oldCol] = null;
    //     this.halfMoveCount++;
    //     piece.lastMove = this.halfMoveCount;
    //     if(piece.type == 'p') {
    //         if(Math.abs(oldCol - newCol) == 2) {
    //             piece.pawnMoveTwoCells = true;
    //         } else piece.pawnMoveTwoCells = false;
    //     }
    //     return capturedPiece;
    // }

    changePiece(row, col, type) {
        this.board[row][col].type = type;
    }

    isCellEmpty(row, col) {
        return Coord.isCoordValid(row, col) && this.board[row][col] == null;
    }
    isCellEnemy(row, col, color) {
        let piece = this.board[row][col];
        return Coord.isCoordValid(row, col) && piece != null && piece.color != color;
    }
    isCellEmptyOrEnemy(row, col, color) {
        return this.isCellEmpty(row, col) || this.isCellEnemy(row, col, color);
    }
    isCellUnderAttack(row, col, color) {
        let kx = row, ky = col;
        let oppositeColor = color == 'wh' ? 'bl' : 'wh';
        // check king
        for (let i = kx - 1; i <= kx + 1; i++) {
            for (let j = ky - 1; j <= ky + 1; j++) {
                if (Coord.isCoordValid(i, j) && this.board[i][j] != null) {
                    let pc = this.board[i][j];
                    if (pc.color == oppositeColor && pc.type == 'k') {
                        return true;
                    }
                }
            }
        }
        // check horizontal, vertical
        for (let i = kx - 1; i >= 0; i--) {
            if (this.board[i][ky] != null) {
                let pc = this.board[i][ky];
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'r')) {
                    return true;
                }
                break;
            }
        }
        for (let i = kx + 1; i < 8; i++) {
            if (this.board[i][ky] != null) {
                let pc = this.board[i][ky];
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'r')) {
                    return true;
                }
                break;
            }
        }
        for (let j = ky - 1; j >= 0; j--) {
            if (this.board[kx][j] != null) {
                let pc = this.board[kx][j];
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'r')) {
                    return true;
                }
                break;
            }
        }
        for (let j = ky + 1; j < 8; j++) {
            if (this.board[kx][j] != null) {
                let pc = this.board[kx][j];
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'r')) {
                    return true;
                }
                break;
            }
        }
        // check diagonal
        for (let i = 1; i < 7; i++) {
            if (!Coord.isCoordValid(kx - i, ky - i)) {
                break;
            }
            let pc = this.board[kx - i][ky - i];
            if (pc != null) {
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'b')) {
                    return true;
                }
                break;
            }
        }
        for (let i = 1; i < 7; i++) {
            if (!Coord.isCoordValid(kx - i, ky + i)) {
                break;
            }
            let pc = this.board[kx - i][ky + i];
            if (pc != null) {
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'b')) {
                    return true;
                }
                break;
            }
        }
        for (let i = 1; i < 7; i++) {
            if (!Coord.isCoordValid(kx + i, ky - i)) {
                break;
            }
            let pc = this.board[kx + i][ky - i];
            if (pc != null) {
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'b')) {
                    return true;
                }
                break;
            }
        }
        for (let i = 1; i < 7; i++) {
            if (!Coord.isCoordValid(kx + i, ky + i)) {
                break;
            }
            let pc = this.board[kx + i][ky + i];
            if (pc != null) {
                if (pc.color == oppositeColor && (pc.type == 'q' || pc.type == 'b')) {
                    return true;
                }
                break;
            }
        }
        // check knight
        let knightX = new Array(-2, -2, -1, -1, 1, 1, 2, 2);
        let knightY = new Array(-1, 1, -2, 2, -2, 2, -1, 1);
        for (let i = 0; i < 8; i++) {
            let x = kx + knightX[i], y = ky + knightY[i];
            if (Coord.isCoordValid(x, y) && this.board[x][y] != null) {
                let pc = this.board[x][y];
                if (pc.color == oppositeColor && pc.type == 'n') {
                    return true;
                }
            }
        }
        // check pawn
        let frontDir, px, py;
        if (color == 'wh') py = ky + 1;
        else py = ky - 1;
        px = kx - 1;
        if (Coord.isCoordValid(px, py) && this.board[px][py] != null) {
            let pc = this.board[px][py];
            if (pc.color == oppositeColor && pc.type == 'p') {
                return true;
            }
        }
        px = kx + 1;
        if (Coord.isCoordValid(px, py) && this.board[px][py] != null) {
            let pc = this.board[px][py];
            if (pc.color == oppositeColor && pc.type == 'p') {
                return true;
            }
        }

        return false;
    }
    getCoords(color, type) {
        let coords = new Array();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let pc = this.board[i][j];
                if (pc != null && pc.color == color && pc.type == type) {
                    coords.push(new Coord(i, j));
                }
            }
        }
        return coords;
    }
    /**
     * Returns whether the king of a given color is in check or not.
     * @param  {string} color  Color of the king.
     * @returns  {boolean}  Whether the king is in check.
     */
    isInCheck(color) {
        let king = this.getCoords(color, 'k')[0];
        return this.isCellUnderAttack(king[0], king[1], color);
    }

    /**
     * Returns the existence of a movable piece of a given color.
     * @param  {string} color  Color of the pieces.
     * @returns  {boolean}  Existence of a movable piece of the color.
     */
    isAnyPieceMovable(color) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let pc = this.board[i][j];
                if (pc != null && pc.color == color) {
                    if (this.getLegalMoveCoords(i, j).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Gets coordinates of pseudo legal moves in particular linear direction.
     * @param  {string} color  Color of the piece.
     * @param  {number} row  Row of the piece.
     * @param  {number} col  Column of the piece.
     * @param  {number} rowdir  Row direction used to search.
     * @param  {number} coldir  Column direction used to search.
     * @returns  {Array<Array<number>>}  Coordinates of pseudo legal moves in particular direction.
     */
    getLinearPseudoLegalMoveCoords(color, row, col, rowdir, coldir) {
        let linearPseudoLegalMoves = new Array();
        for (let i = 1; i < 8; i++) {
            let x = row + rowdir * i;
            let y = col + coldir * i;
            if (!Coord.isCoordValid(x, y)) {
                // if searching cell is out of the board
                break;
            }
            if (this.board[x][y] != null) {
                // if searching cell is a piece
                if (this.board[x][y].color != color) {
                    // if color of the piece is opposite
                    linearPseudoLegalMoves.push(new Coord(x, y));
                }
                break;
            } else {
                // if searching cell is empty
                linearPseudoLegalMoves.push(new Coord(x, y));
            }
        }
        return linearPseudoLegalMoves;
    }

    /**
     * Gets coordinates of pseudo legal moves.
     * Pseudo legal move is a move that the piece can do, without considering the check.
     * @param  {number} row  Row of the piece.
     * @param  {number} col  Column of the piece.
     * @returns  {Array<Array<number>>}  Coordinates of pseudo legal moves of the piece.
     */
    getPseudoLegalMoveCoords(row, col) {
        let pseudoLegalMoveCoords = new Array();
        let piece = this.board[row][col];
        if (piece.type == 'k') {
            for (let i = row - 1; i <= row + 1; i++) {
                for (let j = col - 1; j <= col + 1; j++) {
                    if (this.isCellEmptyOrEnemy(i, j, piece.color)) {
                        pseudoLegalMoveCoords.push(new Coord(i, j));
                    }
                }
            }
            // castling
            if (piece.lastMove == 0 && row == 4
                && (col == 0 && piece.color == 'wh' || col == 7 && piece.color == 'bl')
            ) {
                let kingSide = this.board[7][col];
                if (kingSide != null && kingSide.color == piece.color
                    && kingSide.type == 'r' && kingSide.lastMove == 0
                    && !this.isCellUnderAttack(4, col, piece.color)
                    && this.isCellEmpty(5, col) && !this.isCellUnderAttack(5, col, piece.color)
                    && this.isCellEmpty(6, col) && !this.isCellUnderAttack(6, col, piece.color)
                ) {
                    let coord = new Coord(6, col);
                    coord.push(MoveCode.KING_SIDE_CASTLING);
                    pseudoLegalMoveCoords.push(coord);
                }
                let queenSide = this.board[0][col];
                if (queenSide != null && queenSide.color == piece.color
                    && queenSide.type == 'r' && queenSide.lastMove == 0
                    && !this.isCellUnderAttack(4, col, piece.color)
                    && this.isCellEmpty(3, col) && !this.isCellUnderAttack(3, col, piece.color)
                    && this.isCellEmpty(2, col) && !this.isCellUnderAttack(2, col, piece.color)
                ) {
                    let coord = new Coord(2, col);
                    coord.push(MoveCode.QUEEN_SIDE_CASTLING);
                    pseudoLegalMoveCoords.push(coord);
                }
            }
        } else if (piece.type == 'q') {
            let tmp = new Array();
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, 0));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, 1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 0, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 0, 1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, 0));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, 1));
            pseudoLegalMoveCoords = tmp.flat();
        } else if (piece.type == 'r') {
            let tmp = new Array();
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, 0));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 0, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 0, 1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, 0));
            pseudoLegalMoveCoords = tmp.flat();
        } else if (piece.type == 'b') {
            let tmp = new Array();
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, -1, 1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, -1));
            tmp.push(this.getLinearPseudoLegalMoveCoords(piece.color, row, col, 1, 1));
            pseudoLegalMoveCoords = tmp.flat();
        } else if (piece.type == 'n') {
            let dirX = new Array(-2, -2, -1, -1, 1, 1, 2, 2);
            let dirY = new Array(-1, 1, -2, 2, -2, 2, -1, 1);
            for (let i = 0; i < 8; i++) {
                let x = row + dirX[i], y = col + dirY[i];
                if (this.isCellEmptyOrEnemy(x, y, piece.color)) {
                    pseudoLegalMoveCoords.push(new Coord(x, y));
                }
            }
        } else if (piece.type == 'p') {
            let frontDir = (piece.color == 'wh') ? 1 : -1;
            if (this.isCellEmpty(row, col + frontDir)) {
                let coord = new Coord(row, col + frontDir);
                // promotion - white 6, black 1
                if(col == 3.5 + 2.5 * frontDir) {
                    coord.push(MoveCode.PROMOTION_SELECTION);
                }
                pseudoLegalMoveCoords.push(coord);
            }
            if (col == 3.5 - frontDir * 2.5 && this.isCellEmpty(row, col + frontDir)) {
                // white 1, black 6
                if (this.isCellEmpty(row, col + frontDir * 2)) {
                    pseudoLegalMoveCoords.push(new Coord(row, col + frontDir * 2));
                }
            }
            if (this.isCellEnemy(row - 1, col + frontDir, piece.color)) {
                let coord = new Coord(row - 1, col + frontDir);
                // promotion - white 6, black 1
                if(col == 3.5 + 2.5 * frontDir) {
                    coord.push(MoveCode.PROMOTION_SELECTION);
                }
                pseudoLegalMoveCoords.push(coord);
            }
            if (this.isCellEnemy(row + 1, col + frontDir, piece.color)) {
                let coord = new Coord(row + 1, col + frontDir);
                // promotion - white 6, black 1
                if(col == 3.5 + 2.5 * frontDir) {
                    coord.push(MoveCode.PROMOTION_SELECTION);
                }
                pseudoLegalMoveCoords.push(coord);
            }
            // en passant
            if (this.isCellEnemy(row - 1, col, piece.color)) {
                let enemy = this.board[row - 1][col];
                if(enemy.type == 'p' && enemy.lastMove == this.halfMoveCount && enemy.pawnMoveTwoCells) {
                    let coord = new Coord(row - 1, col + frontDir);
                    coord.push(MoveCode.EN_PASSANT);
                    pseudoLegalMoveCoords.push(coord);
                }
            }
            if (this.isCellEnemy(row + 1, col, piece.color)) {
                let enemy = this.board[row + 1][col];
                if(enemy.type == 'p' && enemy.lastMove == this.halfMoveCount && enemy.pawnMoveTwoCells) {
                    let coord = new Coord(row + 1, col + frontDir);
                    coord.push(MoveCode.EN_PASSANT);
                    pseudoLegalMoveCoords.push(coord);
                }
            }
        }
        return pseudoLegalMoveCoords;
    }

    /**
     * Gets coordinates of legal moves.
     * Legal move is a move that the piece can do, considering the check.
     * @param  {number} row  Row of the piece.
     * @param  {number} col  Column of the piece.
     * @returns  {Array<Array<number>>}  Coordinates of pseudo legal moves of the piece.
     */
    getLegalMoveCoords(row, col) {
        let legalMoveCoords = new Array();
        let ox = row, oy = col;
        let pseudoLegalMoveCoords = this.getPseudoLegalMoveCoords(ox, oy);
        for (let plmc of pseudoLegalMoveCoords.values()) {
            let nx = plmc.r, ny = plmc.c;
            let color = this.board[ox][oy].color;
            let movingPiece = this.board[ox][oy];
            let capturedPiece = this.removePiece(nx, ny);
            this.board[nx][ny] = movingPiece;
            this.board[ox][oy] = null;
            if (!this.isInCheck(color)) {
                legalMoveCoords.push(plmc);
            }
            this.removePiece(nx, ny);
            this.board[ox][oy] = movingPiece;
            this.board[nx][ny] = capturedPiece;
        }
        return legalMoveCoords;
    }
}

class ChessUI {
    constructor() {
        this.boardUI = document.getElementsByClassName('board')[0];
        this.boardBackgroundUI = this.boardUI.getElementsByClassName('board-background')[0];
        this.boardPiecesUI = this.boardUI.getElementsByClassName('board-pieces')[0];
        this.boardMovesUI = this.boardUI.getElementsByClassName('board-moves')[0];
    }
    squareNum2Coord(squareNum) {
        return new Array(parseInt(squareNum[7]), parseInt(squareNum[8]));
    }
    coord2SquareNum(coord) {
        return 'square-' + coord[0] + coord[1];
    }
    createPieceTemplate(color, type) {
        // color: 'wh', 'bl'
        // type: 'k', 'q', 'r', 'b', 'n', 'p'
        let pieceTemplate = document.createElement('div');
        pieceTemplate.classList.add('piece', color, type);
        return pieceTemplate;
    }
    createPieceUI(color, type, row, col) {
        let pieceUI = this.createPieceTemplate(color, type);
        pieceUI.classList.add('square-' + row + col);
        pieceUI.addEventListener('click', function () {
            game.onPieceClick(Coord.squareNumToCoord(pieceUI.classList[3]));
        });
        this.boardPiecesUI.appendChild(pieceUI);
        return pieceUI;
    }
    removePieceUI(row, col) {
        let pieceUIs = this.boardUI.getElementsByClassName('piece square-' + row + col);
        if (pieceUIs.length > 0) pieceUIs[0].remove();
    }
    movePieceUI(oldRow, oldCol, newRow, newCol) {
        let pieceUI = this.boardUI.getElementsByClassName('piece square-' + oldRow + oldCol)[0];
        this.removePieceUI(newRow, newCol);
        pieceUI.classList.remove('square-' + oldRow + oldCol);
        pieceUI.classList.add('square-' + newRow + newCol);
    }
    changePieceUI(row, col, type) {
        let pieceUI = this.boardUI.getElementsByClassName('piece square-' + row + col)[0];
        pieceUI.classList.replace(pieceUI.classList[2], type)
    }
    clearHighlightUIs() {
        let highlights = this.boardUI.getElementsByClassName('highlight');
        while (highlights.length > 0) {
            highlights[0].remove();
        }
    }
    clearBlueHighlightUIs() {
        let blueHighlights = this.boardUI.getElementsByClassName('highlight blue');
        while (blueHighlights.length > 0) {
            blueHighlights[0].remove();
        }
    }
    createHighlightUI(row, col, type = 0) {
        let highlightUI = document.createElement('div');
        highlightUI.classList.add('highlight', 'square-' + row + col);
        if (type > 0) highlightUI.classList.add('blue');
        this.boardBackgroundUI.appendChild(highlightUI);
    }
    removeHighlightUI(row, col) {
        let highlightUIs = this.boardUI.getElementsByClassName('highlight square-' + row + col);
        if (highlightUIs.length > 0) highlightUIs[0].remove();
    }
    clearPathUIs() {
        let moveUIs = this.boardUI.getElementsByClassName('move');
        while (moveUIs.length > 0) {
            moveUIs[0].remove();
        }
    }
    createPathUI(path) {
        let row = path[0], col = path[1];
        let pathUI = document.createElement('div');
        pathUI.classList.add('move');
        if (this.boardUI.getElementsByClassName('piece square-' + row + col).length > 0) {
            pathUI.classList.add('occupied');
        } else pathUI.classList.add('empty');
        pathUI.classList.add('square-' + row + col);
        pathUI.addEventListener('click', function () {
            game.onPathClick(path);
        });
        this.boardMovesUI.appendChild(pathUI);
    }
    clearBoardUIs() {
        let pieceUIs = this.boardPiecesUI.getElementsByClassName('piece');
        while (pieceUIs.length > 0) {
            pieceUIs[0].remove();
        }
        this.clearHighlightUIs();
        this.clearPathUIs();
    }
}

class Game {
    constructor() {
        this.logic = new ChessLogic();
        this.ui = new ChessUI();
        /**@type {Coord} */
        this.selectedCoord = null; // selectedPieceCoord
        /**@type {Color} */
        this.turn = null; // 'wh': white, 'bl': black
    }
    clearBoard() {
        game.logic.clearBoard();
        game.ui.clearBoardUIs();
    }
    createPiece(color, type, row, col) {
        this.logic.createPiece(color, type, row, col);
        this.ui.createPieceUI(color, type, row, col);
    }
    removePiece(row, col) {
        this.logic.removePiece(row, col);
        this.ui.removePieceUI(row, col);
    }
    movePiece(oldRow, oldCol, newRow, newCol) {
        this.logic.movePiece(oldRow, oldCol, newRow, newCol);
        this.ui.movePieceUI(oldRow, oldCol, newRow, newCol);
    }
    changePiece(row, col, type) {
        this.logic.changePiece(row, col, type);
        this.ui.changePieceUI(row, col, type);
    }
    init() {
        this.clearBoard();
        this.createPiece('wh', 'r', 0, 0);
        this.createPiece('wh', 'n', 1, 0);
        this.createPiece('wh', 'b', 2, 0);
        this.createPiece('wh', 'q', 3, 0);
        this.createPiece('wh', 'k', 4, 0);
        this.createPiece('wh', 'b', 5, 0);
        this.createPiece('wh', 'n', 6, 0);
        this.createPiece('wh', 'r', 7, 0);
        this.createPiece('wh', 'p', 0, 1);
        this.createPiece('wh', 'p', 1, 1);
        this.createPiece('wh', 'p', 2, 1);
        this.createPiece('wh', 'p', 3, 1);
        this.createPiece('wh', 'p', 4, 1);
        this.createPiece('wh', 'p', 5, 1);
        this.createPiece('wh', 'p', 6, 1);
        this.createPiece('wh', 'p', 7, 1);
        this.createPiece('bl', 'p', 0, 6);
        this.createPiece('bl', 'p', 1, 6);
        this.createPiece('bl', 'p', 2, 6);
        this.createPiece('bl', 'p', 3, 6);
        this.createPiece('bl', 'p', 4, 6);
        this.createPiece('bl', 'p', 5, 6);
        this.createPiece('bl', 'p', 6, 6);
        this.createPiece('bl', 'p', 7, 6);
        this.createPiece('bl', 'r', 0, 7);
        this.createPiece('bl', 'n', 1, 7);
        this.createPiece('bl', 'b', 2, 7);
        this.createPiece('bl', 'q', 3, 7);
        this.createPiece('bl', 'k', 4, 7);
        this.createPiece('bl', 'b', 5, 7);
        this.createPiece('bl', 'n', 6, 7);
        this.createPiece('bl', 'r', 7, 7);
    }
    start() {
        this.init();
        this.selectedCoord = null;
        this.turn = Color.white;
    }
    switchTurn() {
        this.turn = (this.turn == 'wh') ? 'bl' : 'wh';
    }
    onBlankClick() {
        if (this.selectedCoord == null) return;
        this.ui.removeHighlightUI(this.selectedCoord);
        this.ui.clearBlueHighlightUIs();
        this.ui.clearPathUIs();
        this.selectedCoord = null;
    }
    /** @param {Coord} coord */
    onPieceClick(coord) {
        if (this.selectedCoord.isEqual(coord)) {
            this.onBlankClick();
            return;
        }
        this.onBlankClick();
        if (!(this.turn == this.logic.board[coord.r][coord.c].color)) {
            return;
        }
        this.selectedCoord = coord;
        this.ui.createHighlightUI(this.selectedCoord);
        let paths = this.logic.getLegalMoveCoords(coord);
        for (let path of paths.values()) {
            this.ui.createPathUI(path);
            if (path.length > 2) this.ui.createHighlightUI(path[0], path[1], path[2]);
        }
    }
    onPathClick(path) {
        if (path.length > 2 && path[2] == MoveCode.PROMOTION_SELECTION) {
            let promoteSelectionWindow = document.getElementsByClassName('promote-selection')[0];
            promoteSelectionWindow.classList.remove('wh', 'bl');
            let selectedPiece = this.logic.board[this.selectedCoord[0]][this.selectedCoord[1]];
            promoteSelectionWindow.classList.add(selectedPiece.color);
            promoteSelectionWindow.removeAttribute('hidden');
            document.getElementsByClassName('board-popup')[0].removeAttribute('hidden');
            let pieceSelections = promoteSelectionWindow.getElementsByClassName('piece');
            for(let ps of pieceSelections) {
                ps.addEventListener('click', function() {
                    game.onPromotionClick(path, ps.classList[1]);
                })
            }
            return;
        }
        let spRow = this.selectedCoord[0], spCol = this.selectedCoord[1];
        let pathRow = path[0], pathCol = path[1];
        // move selected piece to path
        this.movePiece(spRow, spCol, pathRow, pathCol);
        if (path.length > 2) {
            if (path[2] == MoveCode.KING_SIDE_CASTLING) {
                this.movePiece(7, spCol, 5, pathCol);
            } else if (path[2] == MoveCode.QUEEN_SIDE_CASTLING) {
                this.movePiece(0, spCol, 3, pathCol);
            } else if (path[2] == MoveCode.EN_PASSANT) {
                this.removePiece(pathRow, spCol);
            } else if (path[2] == MoveCode.PROMOTION_QUEEN) {
                this.changePiece(pathRow, pathCol, 'q');
            }
        }
        // remove highlight
        this.ui.clearHighlightUIs();
        // remove paths
        this.ui.clearPathUIs();
        // create previous move highlight
        this.ui.createHighlightUI(spRow, spCol);
        this.ui.createHighlightUI(pathRow, pathCol);
        this.selectedCoord = null;
        this.switchTurn();
    }
    onPromotionClick(path, type) {
        let promoteSelectionWindow = document.getElementsByClassName('promote-selection')[0];
        promoteSelectionWindow.setAttribute('hidden', '');
        document.getElementsByClassName('board-popup')[0].setAttribute('hidden', '');
        if(type == 'q') {
            path[2] = MoveCode.PROMOTION_QUEEN;
            this.onPathClick(path);
        } else if(type == 'r') {
            path[2] = MoveCode.PROMOTION_ROOK;
            this.onPathClick(path);
        } else if(type == 'b') {
            path[2] = MoveCode.PROMOTION_BISHOP;
            this.onPathClick(path);
        } else if(type == 'n') {
            path[2] = MoveCode.PROMOTION_KNIGHT;
            this.onPathClick(path);
        }
    }
}

var game = new Game();
game.start();
