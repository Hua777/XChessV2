var DATA = require('./_DATA.js');
var F = require('./_FUNCTION.js');
var Chess = require('./Chess.js');

/**
 * 棋盤
 */
function Board() {
    this.Turn = null;
    this.Finished = true;
    this.Score = null;
    this.Map = null;
    this.HistoryMap = [];
    this.Init = function() {
        this.Turn = DATA.OwnerId['blue'];
        this.Finished = false;
        this.Score = {
            '0': 0,
            '1': 0
        };
        this.Map = F.CreateMap();
        this.HistoryMap.push(this.GetMap_AI());
    }

    this.ChessNumberBetween2Point = (_fx, _fy, _tx, _ty) => {
        var counter = 0;
        _fx = parseInt(_fx);
        _fy = parseInt(_fy);
        _tx = parseInt(_tx);
        _ty = parseInt(_ty);
        if (_fx == _tx) {
            for (var i = F.Min(_fy, _ty) + 1; i <= F.Max(_fy, _ty) - 1; ++i) {
                if (this.Map[i][_fx] !== null) {
                    ++counter;
                }
            }
        } else if (_fy == _ty) {
            for (var i = F.Min(_fx, _tx) + 1; i <= F.Max(_fx, _tx) - 1; ++i) {
                if (this.Map[_fy][i] !== null) {
                    ++counter;
                }
            }
        }
        return counter;
    }

    this.MoveSlashWithoutBlock = (_fx, _fy, _tx, _ty) => {
        var a2p = F.AboutTwoPoint(_fx, _fy, _tx, _ty);
        if (a2p.X > 1 || a2p.Y > 1) {
            var m = F.Max(a2p.X, a2p.Y) - 1;
            a2p.X = a2p.X - m;
            a2p.Y = a2p.Y - m;
        }
        if (a2p.VectorX < 0) a2p.X *= -1;
        if (a2p.VectorY < 0) a2p.Y *= -1;
        return this.Map[_fy + a2p.Y][_fx + a2p.X] === null;
    }

    this.EndOfTheGame = (_ender) => {
        var data = {
            Success: _ender != DATA.OwnerId['looker'],
            Winner: DATA.EnemyId[_ender]
        };
        if (data.Success) this.Finished = true;
        return data;
    }

    this.GetMapNumber_AI = (_n) => {
        if (this.HistoryMap.length > _n) {
            return this.HistoryMap[this.HistoryMap.length - _n - 1];
        }
        return null;
    }

    this.GetMap_AI = () => {
        if (this.Map !== null) {
            var map = [];
            for (var i = 0; i < DATA.Board.Size.Height; ++i) {
                map[i] = [];
                for (var j = 0; j < DATA.Board.Size.Width; ++j) {
                    map[i][j] = 0;
                    if (this.Map[i][j] != null) {
                        var tmp = this.Map[i][j].Id + 1;
                        map[i][j] = (this.Map[i][j].Owner == 0) ? tmp : tmp * -1;
                    }
                }
            }
            return map;
        }
        return null;
    }

    this.MoveTo = (_fx, _fy, _tx, _ty) => {
        if (_fx === undefined || _fy === undefined || _tx === undefined || _ty === undefined) {
            return {
                Success: false,
                Winner: null,
                ErrMsg: 'error click'
            }
        }
        var success = false;
        var winner = null;
        var errmsg = '';
        var fchess = this.Map[_fy][_fx];
        var tchess = this.Map[_ty][_tx];
        if (!this.Finished && !(_fx == _tx && _fy == _ty) && fchess !== null && fchess.Owner == this.Turn) {
            if (fchess.Id == 6) {
                //將帥
                if (tchess !== null && tchess.Id == 6 && _tx == _fx) {
                    //檢查王不見王
                    var c = this.ChessNumberBetween2Point(_fx, _fy, _tx, _ty);
                    if (c == 0) {
                        success = true;
                    } else {
                        errmsg = '你不能在王不見王的路徑上有其他棋子';
                    }
                } else if (F.InOurKingRange(_tx, _ty, fchess.Owner) && F.MoveStraight(_fx, _fy, _tx, _ty, 1)) {
                    //己方九宮格直行橫行每次一步
                    success = true;
                } else {
                    errmsg = '己方九宮格直橫行每次一步';
                }
            } else if (fchess.Id == 5) {
                //士仕
                if (F.InOurKingRange(_tx, _ty, fchess.Owner) && F.MoveSqrt2Slash(_fx, _fy, _tx, _ty, 1)) {
                    //己方九宮格斜行每次一步
                    success = true;
                } else {
                    errmsg = '己方九宮格斜行每次一步';
                }
            } else if (fchess.Id == 4) {
                //象相
                if (F.InOurRange(_tx, _ty, fchess.Owner) && F.MoveSqrt2Slash(_fx, _fy, _tx, _ty, 2) && this.MoveSlashWithoutBlock(_fx, _fy, _tx, _ty)) {
                    //己方範圍斜行每次兩步
                    success = true;
                } else {
                    errmsg = '己方範圍斜行每次兩步';
                }
            } else if (fchess.Id == 3) {
                //車俥
                if (F.InBoard(_tx, _ty) && F.MoveLineStraight(_fx, _fy, _tx, _ty)) {
                    //只要無子阻隔直橫行不限距離移動
                    var c = this.ChessNumberBetween2Point(_fx, _fy, _tx, _ty);
                    if (c == 0) {
                        success = true;
                    } else {
                        errmsg = '你不能在移動路徑上有其他棋子';
                    }
                } else {
                    errmsg = '只要無子阻隔直橫行不限距離移動';
                }
            } else if (fchess.Id == 2) {
                //馬傌
                if (F.InBoard(_tx, _ty) && F.MoveSqrt5Slash(_fx, _fy, _tx, _ty) && this.MoveSlashWithoutBlock(_fx, _fy, _tx, _ty)) {
                    //任何方向前進一步然後斜走一步
                    success = true;
                } else {
                    errmsg = '任何方向前進一步然後斜走一步';
                }
            } else if (fchess.Id == 1) {
                //砲炮
                if (F.InBoard(_tx, _ty) && F.MoveLineStraight(_fx, _fy, _tx, _ty)) {
                    //走法與車相同吃子時需與目標間有一個任何一方的棋子相隔
                    var c = this.ChessNumberBetween2Point(_fx, _fy, _tx, _ty);
                    if (tchess !== null && c == 1) {
                        success = true;
                    } else if (c == 0 && tchess === null) {
                        success = true;
                    } else {
                        errmsg = '路上不能有其他棋子或是吃的時候中間要有棋子';
                    }
                } else {
                    errmsg = '走法與車相同吃子時需與目標間有一個任何一方的棋子相隔';
                }
            } else if (fchess.Id == 0) {
                //卒兵
                //過河前每次只可向前直行一步，過河後可左右或往前走一步
                if (F.InOurRange(_fx, _fy, fchess.Owner) && F.MoveAhead(_fx, _fy, _tx, _ty, fchess.Owner)) {
                    //過河前
                    success = true;
                } else if (F.InOurRange(_fx, _fy, DATA.EnemyId[fchess.Owner]) && F.MoveAheadLeftRight(_fx, _fy, _tx, _ty, fchess.Owner)) {
                    //過河後
                    success = true;
                } else {
                    errmsg = '過河前每次只可向前直行一步，過河後可左右或往前走一步';
                }
            }
        } else if (this.Finished) errmsg = '遊戲尚未開始';
        else if (_fx == _tx && _fy == _ty) errmsg = '起始與終點位置相同';
        else if (fchess === null) errmsg = '起始點無棋子';
        else if (fchess.Owner != this.Turn) errmsg = '你不能控制那個棋子';
        //以上判斷是否能移動到那處位置
        //以下判斷如果那個位置上有棋子的話
        if (success && (tchess === null || tchess.Owner != fchess.Owner)) {
            if (tchess !== null) {
                if (tchess.Id == 6) {
                    //將軍
                    winner = fchess.Owner;
                }
                this.Score[fchess.Owner] += tchess.Id;
            }
            this.Map[_ty][_tx] = fchess;
            this.Map[_fy][_fx] = null;
            this.Turn = DATA.EnemyId[fchess.Owner];
        } else if (success && tchess !== null && tchess.Owner == fchess.Owner) {
            errmsg = '你吃到同隊的';
            success = false;
        }
        if (winner !== null) this.Finished = true;
        if (success) {
            this.HistoryMap.push(this.GetMap_AI());
        }
        return {
            FChess: fchess ? fchess.Name : '',
            TChess: tchess ? tchess.Name : '',
            FX: _fx,
            FY: _fy,
            TX: _tx,
            TY: _ty,
            Success: success,
            Winner: winner,
            ErrMsg: errmsg
        };
    }
}

module.exports = Board;