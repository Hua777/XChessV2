var DB = require('./_DB.js');
var D = require('./_DATA.js');
var F = require('./_FUNCTION.js');
var FS = require('fs');
var CP = require('child_process');

/**
 * 玩家
 * @param {string} _name 玩家名字
 * @param {socket} _socket 玩家所屬的 Socket
 */
function Person(_name, _socket) {
    this.AI = false;
    this.Name = _name;
    this.Socket = _socket;
    this.NickName = null;
    this.Owner = null;
    this.Room = null;
    this.Depth = 4;
    this.DBBadMaps = [];
    this.Emit = (_to, _data) => {
        if (this.Socket != null) {
            this.Socket.emit(_to, _data);
        }
    }
    this.IAmAI = () => {
        var self = this;
        DB.LoseRecord((_data) => {
            self.DBBadMaps = _data;
            FS.writeFile(__dirname + '/maps/' + self.Room.Name + '.badmap', JSON.stringify(self.DBBadMaps), function(_err) {
                if (_err) console.log(_err);
                else console.log("Bad maps were saved!");
            });
        });
        this.NickName = F.ChineseRandomName() + '_AI';;
        this.AI = true;
    }
    this.Next = (_data, _next) => {
        try {
            var tmpmap = _data.PrevMap;
            var self = this;
            DB.FindChessRecord({
                PrevMap: tmpmap,
                Owner: self.Owner
            }, (_data) => {
                if (_data.Exist) {
                    console.log('Database');
                    var move = _data.Move;
                    _next({
                        Exist: true,
                        Move: move
                    });
                } else {
                    console.log('AlphaBeta');
                    FS.writeFile(__dirname + '/maps/' + self.Room.Name + '.map', JSON.stringify(self.Room.Board.GetMap_AI()), function(_err) {
                        if (_err) console.log(_err);
                        else {
                            console.log("Now map was saved!");
                            var child = CP.fork(__dirname + '/AlphaBeta.js', [self.Room.Name, D.MinInt, D.MaxInt, self.Owner, self.Depth], {
                                silent: true
                            });
                            child.stdout.setEncoding('utf8');
                            child.stdout.on('data', function(_data_child) {
                                var ab = JSON.parse(_data_child);
                                if (ab) {
                                    _next({
                                        Exist: true,
                                        Move: ab
                                    });
                                } else {
                                    _next({
                                        Exist: false
                                    });
                                }
                            });
                            child.stderr.on('data', (_data) => {
                                console.log(_data);
                                _next({
                                    Exist: false
                                });
                            });
                            child.on('close', (_code) => {
                                console.log('CLOSE: ' + _code);
                            });
                        }
                    });
                }
            });
        } catch (ex) {
            _next({
                Exist: false
            });
        }
    }
}

module.exports = Person;