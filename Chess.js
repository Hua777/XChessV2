var DATA = require('./_DATA.js');

/**
 * 棋子
 * @param {string} _owner 藍：0，紅：1
 * @param {string} _id 藍：將6 士5 象4 車3 馬2 砲1 卒0，紅：帥6 仕5 相4 俥3 傌2 炮1 兵0
 */
function Chess(_owner, _id) {
    this.Owner = _owner;
    this.Id = _id;
    this.Name = DATA.ChessName[_owner][_id];
    this.Color = DATA.ChessColor[_owner];
}

module.exports = Chess;