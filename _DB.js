var MySQL = require('mysql');
var SyncMySQL = require('sync-mysql');
var F = require('./_FUNCTION.js');
var D = require('./_DATA.js');

var DBHost = 'HOST';
var DBUser = 'USER';
var DBPassword = 'PASSWORD';
var DBName = 'NAME';

var CONNECTION = MySQL.createConnection({
    host: DBHost,
    user: DBUser,
    password: DBPassword,
    database: DBName
});

CONNECTION.connect();

var SyncCONNECTION = new SyncMySQL({
    host: DBHost,
    user: DBUser,
    password: DBPassword,
    database: DBName
});

var ChessRecordExist = (_data, _next) => {
    var sqlstr = "SELECT * FROM chessrecord WHERE cr_prevmap = '" + JSON.stringify(_data.PrevMap) + "' AND cr_nextmap =  '" + JSON.stringify(_data.NextMap) + "';";
    CONNECTION.query(sqlstr, (_err, _rows, _fiels) => {
        if (_err) throw _err;
        _next({
            Exist: _rows.length >= 1,
            Row: _rows[0],
            Data: _data
        });
    });
}

var UpdateChessRecord = (_data, _next) => {
    _data.Move = F.TwoMapToMove(_data.PrevMap, _data.NextMap);
    var sqlstr = "UPDATE chessrecord SET cr_wincount = cr_wincount + 1 WHERE cr_id = " + _data.Id;
    if (!_data.Win) {
        sqlstr = "UPDATE chessrecord SET cr_losecount = cr_losecount + 1 WHERE cr_id = " + _data.Id;
    }
    CONNECTION.query(sqlstr, (_err, _result) => {
        if (_err) throw err;
        _next();
    });
}

var InsertChessRecord = (_data, _next) => {
    _data.Move = F.TwoMapToMove(_data.PrevMap, _data.NextMap);
    var sqlstr = "INSERT INTO chessrecord (cr_prevmap, cr_nextmap, cr_nextmove, cr_wincount, cr_losecount) VALUES ('" + JSON.stringify(_data.PrevMap) + "', '" + JSON.stringify(_data.NextMap) + "', '" + JSON.stringify(_data.Move) + "', 1, 0)";
    if (!_data.Win) {
        var sqlstr = "INSERT INTO chessrecord (cr_prevmap, cr_nextmap, cr_nextmove, cr_wincount, cr_losecount) VALUES ('" + JSON.stringify(_data.PrevMap) + "', '" + JSON.stringify(_data.NextMap) + "', '" + JSON.stringify(_data.Move) + "', 0, 1)";
    }
    CONNECTION.query(sqlstr, (_err, _result) => {
        if (_err) throw err;
        _next();
    });
}

var FindChessRecord = (_data, _next) => {
    if (_data.Owner == D.OwnerId['red']) {
        _data.PrevMap = F.RotateMap180(_data.PrevMap);
    }
    var sqlstr = "SELECT * FROM chessrecord WHERE cr_prevmap = '" + JSON.stringify(_data.PrevMap) + "' AND cr_wincount * 1.0 / (cr_wincount + cr_losecount) >= 0.75 ORDER BY (cr_wincount + cr_losecount) DESC, cr_wincount * 1.0 / (cr_wincount + cr_losecount) DESC, cr_id DESC;";
    if (_data.Owner == D.OwnerId['red']) {
        sqlstr = "SELECT * FROM chessrecord WHERE cr_prevmap = '" + JSON.stringify(_data.PrevMap) + "' AND cr_losecount * 1.0 / (cr_wincount + cr_losecount) >= 0.75 ORDER BY (cr_wincount + cr_losecount) DESC, cr_losecount * 1.0 / (cr_wincount + cr_losecount) DESC, cr_id DESC;";
    }
    CONNECTION.query(sqlstr, (_err, _rows, _fiels) => {
        if (_err) throw _err;
        if (_rows.length > 0) {
            var move = JSON.parse(_rows[0].cr_nextmove);
            if (_data.Owner == D.OwnerId['red']) {
                move = F.RotateMove180(move);
            }
            _next({
                Exist: _rows.length > 0,
                Move: move
            });
        } else {
            _next({
                Exist: false
            });
        }
    });
}

var NewChessRecord = (_maps, _win) => {
    var n = _maps[0],
        p = null;
    for (var i = 1; i < _maps.length; ++i) {
        p = n;
        n = _maps[i];
        ChessRecordExist({
            PrevMap: p,
            NextMap: n,
            Win: _win
        }, (_data) => {
            if (_data.Exist) {
                UpdateChessRecord({
                    Id: _data.Row.cr_id,
                    Win: _data.Data.Win,
                    PrevMap: _data.Data.PrevMap,
                    NextMap: _data.Data.NextMap
                }, () => {});
            } else {
                InsertChessRecord({
                    PrevMap: _data.Data.PrevMap,
                    NextMap: _data.Data.NextMap,
                    Win: _data.Data.Win
                }, () => {});
            }
        });
    }
}

var LoseRecord = (_next) => {
    var sqlstr = "SELECT *, cr_wincount * 1.0 / (cr_wincount + cr_losecount) AS WINRATE FROM chessrecord WHERE \
    cr_wincount * 1.0 / (cr_wincount + cr_losecount) <= 0.3 OR \
    cr_wincount * 1.0 / (cr_wincount + cr_losecount) >= 0.7 ORDER BY \
    cr_wincount * 1.0 / (cr_wincount + cr_losecount) ASC, \
    cr_id ASC;";
    CONNECTION.query(sqlstr, (_err, _rows, _fiels) => {
        if (_err) throw _err;
        if (_rows.length > 0) {
            var data = [];
            for (var i = 0; i < _rows.length; ++i) {
                var move = JSON.parse(_rows[i].cr_nextmove);
                if (_rows[i].WINRATE >= 0.7) {
                    data[JSON.stringify(F.RotateMap180(JSON.parse(_rows[i].cr_nextmap)))] = {
                        LoseRate: _rows[i].WINRATE,
                        WinRate: 1 - _rows[i].WINRATE
                    };
                } else {
                    data[_rows[i].cr_nextmap] = {
                        WinRate: _rows[i].WINRATE,
                        LoseRate: 1 - _rows[i].WINRATE
                    };
                }
            }
            _next(data);
        }
    });
}

var SyncClearRecord = () => {
    var sqlstr = "TRUNCATE chessrecord;";
    var result = SyncCONNECTION.query(sqlstr);
}

module.exports = {
    NewChessRecord: NewChessRecord,
    FindChessRecord: FindChessRecord,
    SyncClearRecord: SyncClearRecord,
    LoseRecord: LoseRecord
};