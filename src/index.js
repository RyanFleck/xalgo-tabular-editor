import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.css';

/*
 * Square class
 */
function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

Square.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func,
};

/*
 * Board class contains the game state and generates squares.
 */

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
        };
    }

    handleClick(i) {
        const squareArr = this.state.squares.slice();
        squareArr[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({ squares: squareArr, xIsNext: !this.state.xIsNext });
    }

    renderSquare(i) {
        return (
            <Square
                value={this.state.squares[i]}
                instance={i}
                onClick={() => this.handleClick(i)}
            />
        );
    }

    render() {
        const status = `Next player is ${this.state.xIsNext ? 'X' : 'O'}`;

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2) /* All js needs to be in curlies. */}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

/*
 * Game class
 */

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

class Sheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            table: [],
        };
    }

    componentDidMount() {
        //as soon as render completes, the node will be registered.
        this.getCSV('/xa-singapore-example.csv');
    }

    getCSV(url) {
        const sheet = this;
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                const response = xmlhttp.responseText;
                const table = csvToNestedArrays(response);
                sheet.setState({ table: table.slice() });
            }
        };
        xmlhttp.open('GET', url, false);
        xmlhttp.send();
    }

    cellClick(addr) {
        console.log(`Clicked on cell [${addr}]`);
    }

    render() {
        console.log('[SHEET] Rendering table...');
        return (
            <div id="xa-table">
                <h1>Table Viewer</h1>
                {this.state.table.map((sections, s_key) => {
                    return (
                        <table key={s_key} style={{ background: tableColor(s_key) }}>
                            <tbody>
                                {sections.map((rowData, r_key) => {
                                    return (
                                        <Row
                                            first={r_key === 0}
                                            key={r_key}
                                            index={r_key}
                                            elem={rowData}
                                            address={[s_key, r_key]}
                                            cellClick={this.cellClick}
                                        ></Row>
                                    );
                                })}
                            </tbody>
                        </table>
                    );
                })}
            </div>
        );
    }
}

function tableColor(key) {
    const colors = ['#F8E0E0', '#F8ECE0', '#E6F8E0', '#E0ECF8', '#F2E0F7'];
    return colors[key % colors.length];
}

function Row(props) {
    console.log(
        `[ROW] TABLE ${props.address[0]} ROW ${props.address[1]} RENDERED: [${props.elem}]`
    );
    return (
        <tr key={props.index}>
            {props.elem.map((elem, c_key) => {
                const cell_address = props.address.slice();
                cell_address.push(c_key);
                if (props.first) {
                    return (
                        <Cell
                            address={cell_address}
                            head={true}
                            key={c_key}
                            index={c_key}
                            elem={elem}
                            cellClick={props.cellClick}
                        ></Cell>
                    );
                } else {
                    return (
                        <Cell
                            address={cell_address}
                            head={false}
                            key={c_key}
                            index={c_key}
                            elem={elem}
                            cellClick={props.cellClick}
                        ></Cell>
                    );
                }
            })}
        </tr>
    );
}

function Cell(props) {
    //console.log(`[CELL] Cell [${props.address}] rendered.`);
    if (props.head) {
        return (
            <th onClick={() => props.cellClick(props.address)} index={props.index}>
                {props.elem}
            </th>
        );
    } else {
        return (
            <td onClick={() => props.cellClick(props.address)} index={props.index}>
                {props.elem}
            </td>
        );
    }
}

Row.propTypes = {
    index: PropTypes.number,
    elem: PropTypes.arrayOf(PropTypes.string),
    first: PropTypes.bool,
    address: PropTypes.arrayOf(PropTypes.number),
    cellClick: PropTypes.func,
};

Cell.propTypes = {
    index: PropTypes.number,
    elem: PropTypes.string,
    address: PropTypes.arrayOf(PropTypes.number),
    cellClick: PropTypes.func,
};

/* ==================================================== */

function csvToNestedArrays(csvText) {
    const csvWithRegularNewlines = csvText.replace(/(\r\n|\n|\r)/gm, '\n');
    const csvRows = csvWithRegularNewlines.split('\n');

    const groupedRows = [];
    // Group into sections:
    csvRows.forEach((row) => {
        if (row.startsWith('METADATA.') || row.startsWith('INPUT.') || row.startsWith('OUTPUT.')) {
            groupedRows.push([]);
        }
        groupedRows[groupedRows.length - 1].push(rowSplit(row));
    });

    return groupedRows;
}

function rowSplit(row) {
    const rowCells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    let len = rowCells.length - 1;
    while (rowCells[len] == '') {
        rowCells.pop();
        len = rowCells.length - 1;
    }
    return rowCells;
}

/* ==================================================== */

ReactDOM.render(<Sheet />, document.getElementById('root'));
