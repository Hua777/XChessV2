var DATA = require('./_DATA.js');
var Chess = require('./Chess.js');
var CN = require('chinese-name');

/**
 * 最小值
 * @param {number} _m 數字一
 * @param {number} _n 數字二
 */
var Min = (_m, _n) => {
    return _m < _n ? _m : _n;
}

/**
 * 最大值
 * @param {number} _m 數字一
 * @param {number} _n 數字二
 */
var Max = (_m, _n) => {
    return _m > _n ? _m : _n;
}

/**
 * 在整張地圖上
 * @param {number} _x 位置X
 * @param {number} _y 位置Y
 */
var InBoard = (_x, _y) => {
    if (_x >= DATA.Board.Range.From.X &&
        _x <= DATA.Board.Range.To.X &&
        _y >= DATA.Board.Range.From.Y &&
        _y <= DATA.Board.Range.To.Y) {
        return true;
    }
    return false;
}

/**
 * 在己方的九宮格上
 * @param {number} _x 位置X
 * @param {number} _y 位置Y
 * @param {number} _owner 棋子擁有者
 */
var InOurKingRange = (_x, _y, _owner) => {
    if (_owner == DATA.OwnerId['blue'] &&
        _x >= DATA.Board.Range.King.Bottom.From.X &&
        _x <= DATA.Board.Range.King.Bottom.To.X &&
        _y >= DATA.Board.Range.King.Bottom.From.Y &&
        _y <= DATA.Board.Range.King.Bottom.To.Y) {
        return true;
    } else if (_owner == DATA.OwnerId['red'] &&
        _x >= DATA.Board.Range.King.Top.From.X &&
        _x <= DATA.Board.Range.King.Top.To.X &&
        _y >= DATA.Board.Range.King.Top.From.Y &&
        _y <= DATA.Board.Range.King.Top.To.Y) {
        return true;
    }
    return false;
}

/**
 * 在己方的範圍
 * @param {number} _x 位置X
 * @param {number} _y 位置Y
 * @param {number} _owner 棋子擁有者
 */
var InOurRange = (_x, _y, _owner) => {
    if (_owner == DATA.OwnerId['blue'] &&
        _x >= DATA.Board.Range.Bottom.From.X &&
        _x <= DATA.Board.Range.Bottom.To.X &&
        _y >= DATA.Board.Range.Bottom.From.Y &&
        _y <= DATA.Board.Range.Bottom.To.Y) {
        return true;
    } else if (_owner == DATA.OwnerId['red'] &&
        _x >= DATA.Board.Range.Top.From.X &&
        _x <= DATA.Board.Range.Top.To.X &&
        _y >= DATA.Board.Range.Top.From.Y &&
        _y <= DATA.Board.Range.Top.To.Y) {
        return true;
    }
    return false;
}

/**
 * 兩點間的關係
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 */
var AboutTwoPoint = (_fx, _fy, _tx, _ty) => {
    var vx, vy,
        straight = false,
        slash = false,
        o = false,
        r = false,
        l = false,
        u = false,
        d = false;
    vx = _tx - _fx;
    vy = _ty - _fy;
    if (vx > 0 && vy > 0) {
        r = true;
        d = true;
        slash = true;
    } else if (vx > 0 && vy < 0) {
        r = true;
        u = true;
        slash = true;
    } else if (vx < 0 && vy > 0) {
        l = true;
        d = true;
        slash = true;
    } else if (vx < 0 && vy < 0) {
        l = true;
        u = true;
        slash = true;
    } else if (vx == 0 && vy > 0) {
        d = true;
        straight = true;
    } else if (vx == 0 && vy < 0) {
        u = true;
        straight = true;
    } else if (vx < 0 && vy == 0) {
        l = true;
        straight = true;
    } else if (vx > 0 && vy == 0) {
        r = true;
        straight = true;
    } else {
        o = true;
    }
    return {
        X: Math.abs(_fx - _tx),
        Y: Math.abs(_fy - _ty),
        VectorX: _tx - _fx,
        VectorY: _ty - _fy,
        Length: Math.sqrt((_fx - _tx) * (_fx - _tx) + (_fy - _ty) * (_fy - _ty)),
        Forward: {
            Right: r,
            Left: l,
            Up: u,
            Down: d,
            Straight: straight,
            Slash: slash,
            Origin: o
        }
    }
}

/**
 * 檢查是否直橫移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 * @param {number} _number 步數
 */
var MoveStraight = (_fx, _fy, _tx, _ty, _number) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (a2p.Length == _number &&
        a2p.Forward.Straight) return true;
    return false;
}

/**
 * 檢查是否向前移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 * @param {number} _owner 棋子擁有者
 */
var MoveAhead = (_fx, _fy, _tx, _ty, _owner) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (_owner == DATA.OwnerId['blue'] &&
        a2p.Forward.Up &&
        a2p.Length == 1) {
        return true;
    } else if (_owner == DATA.OwnerId['red'] &&
        a2p.Forward.Down &&
        a2p.Length == 1) {
        return true;
    }
    return false;
}

/**
 * 檢查是否向前左右移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 * @param {number} _owner 棋子擁有者
 */
var MoveAheadLeftRight = (_fx, _fy, _tx, _ty, _owner) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (_owner == DATA.OwnerId['blue'] &&
        (a2p.Forward.Up ||
            a2p.Forward.Left ||
            a2p.Forward.Right) &&
        a2p.Length == 1) {
        return true;
    } else if (_owner == DATA.OwnerId['red'] &&
        (a2p.Forward.Down ||
            a2p.Forward.Left ||
            a2p.Forward.Right) &&
        a2p.Length == 1) {
        return true;
    }
    return false;
}

/**
 * 檢查是否直橫無限移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 */
var MoveLineStraight = (_fx, _fy, _tx, _ty) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (a2p.X == 0 || a2p.Y == 0) return true;
    return false;
}

/**
 * 檢查是否馬行移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 */
var MoveSqrt5Slash = (_fx, _fy, _tx, _ty) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (a2p.Length == Math.sqrt(5)) return true;
    return false;
}

/**
 * 檢查是否士行象行移動
 * @param {number} _fx 點1位置X
 * @param {number} _fy 點1位置Y
 * @param {number} _tx 點2位置X
 * @param {number} _ty 點2位置Y
 * @param {number} _number 步數，士行(1)，象行(2)
 */
var MoveSqrt2Slash = (_fx, _fy, _tx, _ty, _number) => {
    var a2p = AboutTwoPoint(_fx, _fy, _tx, _ty);
    if (a2p.Length == _number * Math.sqrt(2)) return true;
    return false;
}

/**
 * 亂數字串
 */
var RandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 建立棋盤地圖
 */
var CreateMap = () => {
    var map = [];
    for (var i = 0; i < DATA.Board.Size.Height; i++) {
        map[i] = [];
        for (var j = 0; j < DATA.Board.Size.Width; j++) {
            map[i][j] = null;
        }
    }
    map[0][4] = new Chess(DATA.OwnerId['red'], 6);
    map[0][3] = new Chess(DATA.OwnerId['red'], 5);
    map[0][5] = new Chess(DATA.OwnerId['red'], 5);
    map[0][2] = new Chess(DATA.OwnerId['red'], 4);
    map[0][6] = new Chess(DATA.OwnerId['red'], 4);
    map[0][0] = new Chess(DATA.OwnerId['red'], 3);
    map[0][8] = new Chess(DATA.OwnerId['red'], 3);
    map[0][1] = new Chess(DATA.OwnerId['red'], 2);
    map[0][7] = new Chess(DATA.OwnerId['red'], 2);
    map[2][1] = new Chess(DATA.OwnerId['red'], 1);
    map[2][7] = new Chess(DATA.OwnerId['red'], 1);
    map[3][0] = new Chess(DATA.OwnerId['red'], 0);
    map[3][2] = new Chess(DATA.OwnerId['red'], 0);
    map[3][4] = new Chess(DATA.OwnerId['red'], 0);
    map[3][6] = new Chess(DATA.OwnerId['red'], 0);
    map[3][8] = new Chess(DATA.OwnerId['red'], 0);
    map[9][4] = new Chess(DATA.OwnerId['blue'], 6);
    map[9][3] = new Chess(DATA.OwnerId['blue'], 5);
    map[9][5] = new Chess(DATA.OwnerId['blue'], 5);
    map[9][2] = new Chess(DATA.OwnerId['blue'], 4);
    map[9][6] = new Chess(DATA.OwnerId['blue'], 4);
    map[9][0] = new Chess(DATA.OwnerId['blue'], 3);
    map[9][8] = new Chess(DATA.OwnerId['blue'], 3);
    map[9][1] = new Chess(DATA.OwnerId['blue'], 2);
    map[9][7] = new Chess(DATA.OwnerId['blue'], 2);
    map[7][1] = new Chess(DATA.OwnerId['blue'], 1);
    map[7][7] = new Chess(DATA.OwnerId['blue'], 1);
    map[6][0] = new Chess(DATA.OwnerId['blue'], 0);
    map[6][2] = new Chess(DATA.OwnerId['blue'], 0);
    map[6][4] = new Chess(DATA.OwnerId['blue'], 0);
    map[6][6] = new Chess(DATA.OwnerId['blue'], 0);
    map[6][8] = new Chess(DATA.OwnerId['blue'], 0);
    return map;
}

/**
 * 取得敵對ID
 * @param {number} _owner 擁有者
 */
var EnemyOwner = (_owner) => {
    return DATA.EnemyId[_owner];
}

/**
 * 在陣列中檢查是否有此物件
 * @param {Array} _arr 陣列
 * @param {Object} _obj 物件
 */
var ArrHave = (_arr, _obj) => {
    for (var i = 0; i < _arr.length; i++) {
        if (_obj == _arr[i]) {
            return true;
        }
    }
    return false;
};

/**
 * 隨機中文名字
 */
var ChineseRandomName = () => {
    return CN.random();
}

/**
 * 偵測兩張圖後回傳其移動指令
 * @param {*} _mapp 圖一
 * @param {*} _mapn 圖二
 */
var TwoMapToMove = (_mapp, _mapn) => {
    var points = [];
    var pointFrom = -1;
    var pointTo = -1;
    for (var i = 0; i < DATA.Board.Size.Height; ++i) {
        for (var j = 0; j < DATA.Board.Size.Width; ++j) {
            if (_mapp[i][j] != _mapn[i][j]) {
                points.push({
                    X: j,
                    Y: i
                });
                if (_mapn[i][j] == 0 && _mapp[i][j] != 0) {
                    pointFrom = points.length - 1;
                } else {
                    pointTo = points.length - 1;
                }
            }
        }
    }
    if (points.length != 2) {
        return null;
    }
    return {
        FX: points[pointFrom].X,
        FY: points[pointFrom].Y,
        TX: points[pointTo].X,
        TY: points[pointTo].Y,
        Owner: ConvertChessSMIdToOwner(_mapp[points[pointFrom].Y][points[pointFrom].X])
    };
}

var RotateMap180 = (_map) => {
    var tmpmap = [];
    for (var i = 0, ii = DATA.Board.Size.Height - 1; i < DATA.Board.Size.Height; i++, ii--) {
        tmpmap[ii] = [];
        for (var j = 0, jj = DATA.Board.Size.Width - 1; j < DATA.Board.Size.Width; j++, jj--) {
            tmpmap[ii][jj] = _map[i][j] * -1;
        }
    }
    return tmpmap;
}

var RotatePos180 = (_xy) => {
    if (_xy !== null) {
        return {
            X: DATA.Board.Size.Width - _xy.X - 1,
            Y: DATA.Board.Size.Height - _xy.Y - 1
        }
    }
    return null;
}

var RotateMove180 = (_move) => {
    var pos1 = RotatePos180({
        X: _move.FX,
        Y: _move.FY
    });
    var pos2 = RotatePos180({
        X: _move.TX,
        Y: _move.TY
    });
    return {
        FX: pos1.X,
        FY: pos1.Y,
        TX: pos2.X,
        TY: pos2.Y
    };
}

var ConvertChessSMIdToOwner = (_smid) => {
    if (_smid > 0) {
        return 0;
    } else if (_smid < 0) {
        return 1;
    } else {
        return -1;
    }
}

var SearchEnemyKing = (_map, _turn) => {
    for (var i = 0; i < DATA.Board.Size.Height; ++i) {
        for (var j = 0; j < DATA.Board.Size.Width; ++j) {
            if ((_map[i][j] == 7 && _turn == 1) || (_map[i][j] == -7 && _turn == 0)) {
                return {
                    X: j,
                    Y: i
                }
            }
        }
    }
    return null;
}

var SmIdOneOrNOne = (_smid) => {
    return (ConvertChessSMIdToOwner(_smid) * 2 - 1) * -1;
}

var TurnOneOrNOne = (_turn) => {
    return (_turn * 2 - 1) * -1;
}

var HowCanIWalk = (_map, _turn) => {
    var walks = [];
    var UDLR = [{ X: 0, Y: -1 }, { X: 0, Y: 1 }, { X: -1, Y: 0 }, { X: 1, Y: 0 }];
    var UDLR45o = [{ X: -1, Y: -1 }, { X: -1, Y: 1 }, { X: 1, Y: -1 }, { X: 1, Y: 1 }];
    var UDLR60o = [{ X: -1, Y: -2 }, { X: 1, Y: -2 }, { X: 1, Y: 2 }, { X: -1, Y: 2 }, { X: -2, Y: -1 }, { X: -2, Y: 1 }, { X: 2, Y: -1 }, { X: 2, Y: 1 }];
    for (var i = 0; i < DATA.Board.Size.Height; ++i) {
        for (var j = 0; j < DATA.Board.Size.Width; ++j) {
            if (_map[i][j] != 0 && ConvertChessSMIdToOwner(_map[i][j]) == _turn) {
                var id = Math.abs(_map[i][j]);
                if (id == 7) { //將帥
                    var kpos = SearchEnemyKing(_map, _turn);
                    if (kpos && j == kpos.X) {
                        var have = false;
                        for (var m = Min(i, kpos.Y) + 1; m <= Max(i, kpos.Y) - 1; ++m) {
                            if (_map[m][j] != 0) {
                                have = true;
                                break;
                            }
                        }
                        if (!have) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: kpos.X,
                                TY: kpos.Y,
                                Id: id
                            });
                        }
                    }
                    for (var m = 0; m < 4; ++m) {
                        var x = j + UDLR[m].X,
                            y = i + UDLR[m].Y;
                        if (InOurKingRange(x, y, _turn) && (_map[y][x] == 0 || ConvertChessSMIdToOwner(_map[y][x]) != _turn)) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: x,
                                TY: y,
                                Id: id
                            });
                        }
                    }
                } else if (id == 6) { //士仕
                    for (var m = 0; m < 4; ++m) {
                        var x = j + UDLR45o[m].X,
                            y = i + UDLR45o[m].Y;
                        if (InOurKingRange(x, y, _turn) && (_map[y][x] == 0 || ConvertChessSMIdToOwner(_map[y][x]) != _turn)) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: x,
                                TY: y,
                                Id: id
                            });
                        }
                    }
                } else if (id == 5) { //象相
                    for (var m = 0; m < 4; ++m) {
                        var x = j + UDLR45o[m].X,
                            y = i + UDLR45o[m].Y,
                            x2 = j + UDLR45o[m].X * 2,
                            y2 = i + UDLR45o[m].Y * 2;
                        if (InOurRange(x2, y2, _turn) && (_map[y2][x2] == 0 || ConvertChessSMIdToOwner(_map[y2][x2]) != _turn) && _map[y][x] == 0) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: x2,
                                TY: y2,
                                Id: id
                            });
                        }
                    }
                } else if (id == 4) { //車俥
                    for (var m = i - 1; m >= 0; --m) { //上
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) == _turn) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: j,
                                TY: m,
                                Id: id
                            });
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) != _turn) break;
                        }
                    }
                    for (var m = i + 1; m < DATA.Board.Size.Height; ++m) { //下
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) == _turn) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: j,
                                TY: m,
                                Id: id
                            });
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) != _turn) break;
                        }
                    }
                    for (var m = j - 1; m >= 0; --m) { //左
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) == _turn) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: m,
                                TY: i,
                                Id: id
                            });
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) != _turn) break;
                        }
                    }
                    for (var m = j + 1; m < DATA.Board.Size.Width; ++m) { //右
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) == _turn) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: m,
                                TY: i,
                                Id: id
                            });
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) != _turn) break;
                        }
                    }
                } else if (id == 3) { //馬傌
                    for (var m = 0; m < 8; ++m) {
                        var x = j + UDLR[Math.floor(m / 2)].X,
                            y = i + UDLR[Math.floor(m / 2)].Y,
                            x2 = j + UDLR60o[m].X,
                            y2 = i + UDLR60o[m].Y;
                        if (InBoard(x2, y2) && (_map[y2][x2] == 0 || ConvertChessSMIdToOwner(_map[y2][x2]) != _turn) && _map[y][x] == 0) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: x2,
                                TY: y2,
                                Id: id
                            });
                        }
                    }
                } else if (id == 2) { //砲炮
                    var m;
                    for (m = i - 1; m >= 0; --m) { //上
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: j,
                                TY: m,
                                Id: id
                            });
                        }
                    }
                    for (m = m - 1; m >= 0; --m) { //跨上
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) != _turn) {
                                walks.push({
                                    FX: j,
                                    FY: i,
                                    TX: j,
                                    TY: m,
                                    Id: id
                                });
                                break;
                            } else if (_map[m][j] != 0) {
                                break;
                            }
                        }
                    }
                    for (m = i + 1; m < DATA.Board.Size.Height; ++m) { //下
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: j,
                                TY: m,
                                Id: id
                            });
                        }
                    }
                    for (m = m + 1; m < DATA.Board.Size.Height; ++m) { //跨下
                        if (InBoard(j, m)) {
                            if (_map[m][j] != 0 && ConvertChessSMIdToOwner(_map[m][j]) != _turn) {
                                walks.push({
                                    FX: j,
                                    FY: i,
                                    TX: j,
                                    TY: m,
                                    Id: id
                                });
                                break;
                            } else if (_map[m][j] != 0) {
                                break;
                            }
                        }
                    }
                    for (m = j - 1; m >= 0; --m) { //左
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: m,
                                TY: i,
                                Id: id
                            });
                        }
                    }
                    for (m = m - 1; m >= 0; --m) { //跨左
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) != _turn) {
                                walks.push({
                                    FX: j,
                                    FY: i,
                                    TX: m,
                                    TY: i,
                                    Id: id
                                });
                                break;
                            } else if (_map[i][m] != 0) {
                                break;
                            }
                        }
                    }
                    for (m = j + 1; m < DATA.Board.Size.Width; ++m) { //右
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0) break;
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: m,
                                TY: i,
                                Id: id
                            });
                        }
                    }
                    for (m = m + 1; m < DATA.Board.Size.Width; ++m) { //跨右
                        if (InBoard(m, i)) {
                            if (_map[i][m] != 0 && ConvertChessSMIdToOwner(_map[i][m]) != _turn) {
                                walks.push({
                                    FX: j,
                                    FY: i,
                                    TX: m,
                                    TY: i,
                                    Id: id
                                });
                                break;
                            } else if (_map[i][m] != 0) {
                                break;
                            }
                        }
                    }
                } else if (id == 1) { //卒兵
                    if (ConvertChessSMIdToOwner(_map[i][j]) == _turn) {
                        var x = j,
                            y = i;
                        if (_turn == DATA.OwnerId['red']) {
                            y = y + UDLR[1].Y;
                        } else {
                            y = y + UDLR[0].Y;
                        }
                        if (InBoard(j, y) && (_map[y][j] == 0 || ConvertChessSMIdToOwner(_map[y][j]) != _turn)) {
                            walks.push({
                                FX: j,
                                FY: i,
                                TX: j,
                                TY: y,
                                Id: id
                            });
                        }
                        if (InOurRange(j, i, EnemyOwner(_turn))) {
                            for (var m = 2; m <= 3; ++m) {
                                x = j + UDLR[m].X;
                                if (InBoard(x, i) && (_map[i][x] == 0 || ConvertChessSMIdToOwner(_map[i][x]) != _turn)) {
                                    walks.push({
                                        FX: j,
                                        FY: i,
                                        TX: x,
                                        TY: i,
                                        Id: id
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function compare(a, b) {
        if (a.Id > b.Id)
            return -1;
        if (a.Id < b.Id)
            return 1;
        return 0;
    }
    walks.sort(compare);
    return walks;
}

var SmallMapToChinese = (_map) => {
    var result = '';
    for (var i = 0; i < DATA.Board.Size.Height; ++i) {
        for (var j = 0; j < DATA.Board.Size.Width; ++j) {
            if (_map[i][j] != 0) {
                result += DATA.ChessName[ConvertChessSMIdToOwner(_map[i][j])][Math.abs(_map[i][j]) - 1];
            } else {
                result += '　';
            }
        }
        result += '\n';
    }
    return result;
}

module.exports = {
    Min: Min,
    Max: Max,
    InBoard: InBoard,
    InOurKingRange: InOurKingRange,
    InOurRange: InOurRange,
    AboutTwoPoint: AboutTwoPoint,
    MoveStraight: MoveStraight,
    MoveAhead: MoveAhead,
    MoveAheadLeftRight: MoveAheadLeftRight,
    MoveLineStraight: MoveLineStraight,
    MoveSqrt5Slash: MoveSqrt5Slash,
    MoveSqrt2Slash: MoveSqrt2Slash,
    RandomId: RandomId,
    CreateMap: CreateMap,
    EnemyOwner: EnemyOwner,
    ArrHave: ArrHave,
    ChineseRandomName: ChineseRandomName,
    TwoMapToMove: TwoMapToMove,
    RotateMap180: RotateMap180,
    RotatePos180: RotatePos180,
    RotateMove180: RotateMove180,
    HowCanIWalk: HowCanIWalk,
    ConvertChessSMIdToOwner: ConvertChessSMIdToOwner,
    SmIdOneOrNOne: SmIdOneOrNOne,
    TurnOneOrNOne: TurnOneOrNOne,
    SmallMapToChinese: SmallMapToChinese
}