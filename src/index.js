import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    const className = props.highlight ? "square highlight" : "square";
    return (
        <button className={className} key={props.value}
                onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, row, col) {
        const highlight = this.props.lines.some(item => item === i);
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i, row, col)}
                highlight={highlight}
            />
        );
    }

    renderBoard({rowSize, colSize}) {
        const board = [];
        for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
            let squareCols = [];
            for (let colIndex = 0; colIndex < colSize; colIndex++) {
                let squareIndex = (rowIndex * colSize) + colIndex;
                squareCols.push(this.renderSquare(squareIndex, rowIndex, colIndex));
            }
            board.push(
                <div key={rowIndex} className="board-row">
                    {squareCols}
                </div>
            );
        }
        return board;
    }

    render() {
        return (
            <div>
                {this.renderBoard(this.props.boardSize)}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coordinate: {row: null, col: null},
            }],
            xIsNext: true,
            stepNumber: 0,
            boardSize: {
                rowSize: 3,
                colSize: 3,
            },
            historyOrderAsc: true,
        }
    }

    handleClick(i, row, col) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const {winner} = calculateWinner(squares);
        if (winner || squares[i]) return;
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([{
                squares: squares,
                coordinate: {row: row, col: col}
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    reverseHistoryOrder() {
        this.setState({
            historyOrderAsc: !this.state.historyOrderAsc,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const {lines, winner} = calculateWinner(current.squares);
        const historyOrder = this.state.historyOrderAsc;

        const moves = history.map((step, move) => {
            const coordinate = '(' + step.coordinate.col + ', ' + step.coordinate.row + ')';
            const desc = move ? 'Go to move #' + move + ' ' + coordinate : 'Go to game start';
            return (
                <li key={move}>
                    <button className="jump-to"
                            onClick={() => this.jumpTo(move)}>
                        {desc}
                    </button>
                </li>
            );
        })
        if (!historyOrder) moves.reverse();

        let status = winner ? "Winner: " + winner : "Next player: " + (this.state.xIsNext ? "X" : "O");
        if (!winner && this.state.stepNumber === 9) status = "Draw game";
        let historyOrderStatus = historyOrder ? "Ascending" : "Descending";

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        boardSize={this.state.boardSize}
                        lines={lines}
                        onClick={(i, row, col) => this.handleClick(i, row, col)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>History order: <button onClick={() => this.reverseHistoryOrder()}>{historyOrderStatus}</button>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game/>);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {lines: lines[i], winner: squares[a]};
            //return squares[a];
        }
    }
    return {lines: [], winner: null};
}
