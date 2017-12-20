var B = require('./Board.js');
var F = require('./_FUNCTION.js');
var DATA = require('./_DATA.js');
var AI = require('./AI.js');
var DB = require('./_DB.js');

Array.prototype.remove = (e) => { for (var i = 0; i < this.length; i++) { if (e == this[i]) { return this.splice(i, 1); } } };

/**
 * 房間
 * @param {string} _name 房間名
 */
function Room(_name) {
    this.DAIRoom = false;
    this.AI = null;
    this.AI1 = null;
    this.AI2 = null;
    this.AIRoom = false;
    this.Name = _name;
    this.Board = new B();
    this.Board.Init();
    this.Players = [null, null];
    this.Lookers = [];
    this.Winner = null;
    this.IsAIRoom = () => {
        if (this.PlayersLen() < 2) {
            this.AIRoom = true;
            this.AI = AI();
            this.Join(this.AI);
        }
    }
    this.PlayersLen = () => {
        var c = 0;
        for (var i = 0; i < 2; ++i) {
            if (this.Players[i] !== null) ++c;
        }
        return c;
    }
    this.LookersLen = () => {
        return this.Lookers.length;
    }
    this.Have = (_person) => {
        if (F.ArrHave(this.Players, _person)) {
            return true;
        } else {
            return F.ArrHave(this.Lookers, _person);
        }
    }
    this.Join = (_person) => {
        if (this.Have(_person)) {
            return false;
        }
        if (this.Players[0] === null) {
            this.Players[0] = _person;
            _person.Owner = 0;
            this.SendPlayersData(1);
        } else if (this.Players[1] === null) {
            this.Players[1] = _person;
            _person.Owner = 1;
            this.SendPlayersData(1);
        } else {
            this.Lookers.push(_person);
            _person.Owner = 2;
            this.SendLookersData(1);
        }
        _person.Room = this;
        this.SendSelfInfo();
        this.SendMap();
        this.SendTurn();
        this.SendPlayersData(0);
        this.SendLookersData(0);
        return true;
    }
    this.Remove = (_person) => {
        if (_person == null) return;
        _person.Room = null;
        for (var i = 0; i < 2; ++i) {
            if (this.Players[i] == _person) {
                this.Players[i] = null;
                this.SendPlayersData(-1);
                if (this.PlayersLen() == 0) {
                    this.End();
                }
                break;
            }
        }
        if (F.ArrHave(this.Lookers, _person)) {
            this.Lookers.remove(_person);
            this.SendLookersData(-1);
        }
        this.SendPlayersData(0);
        this.SendLookersData(0);
    }
    this.Emit = (_person, _to, _data) => {
        try {
            _person.Emit(_to, _data);
        } catch (e) {
            console.log(e);
        }
    }
    this.EmitPlayers = (_to, _data) => {
        for (var i = 0; i < 2; ++i) {
            if (this.Players[i] !== null) {
                this.Emit(this.Players[i], _to, _data);
            }
        }
    }
    this.EmitLookers = (_to, _data) => {
        for (var i = 0; i < this.Lookers.length; ++i) {
            this.Emit(this.Lookers[i], _to, _data);
        }
    }
    this.EmitAll = (_to, _data) => {
        this.EmitPlayers(_to, _data);
        this.EmitLookers(_to, _data);
    }
    this.SendSelfInfo = () => {
        for (var i = 0; i < 2; ++i) {
            if (this.Players[i] !== null) {
                this.Players[i].Emit('info', {
                    OwnerName: DATA.OwnerName[this.Players[i].Owner],
                    Owner: this.Players[i].Owner,
                    Name: this.Players[i].NickName
                });
            }
        }
        for (var i = 0; i < this.Lookers.length; ++i) {
            this.Lookers[i].Emit('info', {
                OwnerName: DATA.OwnerName[this.Lookers[i].Owner],
                Owner: this.Lookers[i].Owner,
                Name: this.Lookers[i].NickName
            });
        }
    }
    this.SendTurn = () => {
        this.EmitAll('turn', {
            Turn: this.Board.Turn
        });
    }
    this.SendPlayersData = (_changed) => {
        this.EmitAll('players', {
            Length: this.PlayersLen(),
            Names: {
                '0': (this.Players[0] !== null ? this.Players[0].NickName : ''),
                '1': (this.Players[1] !== null ? this.Players[1].NickName : '')
            },
            Changed: _changed
        });
    }
    this.SendLookersData = (_changed) => {
        this.EmitAll('lookers', {
            Length: this.LookersLen(),
            Changed: _changed
        });
    }
    this.SendMap = () => {
        this.EmitAll('map', this.Board.Map);
    }
    this.SendErrMsg = (_person, _msg) => {
        this.Emit(_person, 'msg', {
            ErrMsg: _msg
        });
    }
    this.SendMove = (_data) => {
        this.EmitAll('move', _data);
    }

    this.Record = () => {
        DB.NewChessRecord(this.Board.HistoryMap, this.Winner == this.Players[0]);
    }

    this.Same = () => {
        var checknum = 16;
        if (this.Board.HistoryMap.length > checknum) {
            var ms = [];
            for (var i = 0; i < checknum; ++i) {
                ms[i] = JSON.stringify(this.Board.GetMapNumber_AI(i));
            }
            var check = true;
            for (var i = 0; i < checknum / 2; ++i) {
                if (ms[i] != ms[i + checknum / 2]) {
                    check = false;
                    break;
                }
            }
            return check;
        }
        return false;
    }

    //Someone surrender
    this.EndOfTheGame = (_ender) => {
        if (this.PlayersLen() == 2) {
            var data = this.Board.EndOfTheGame(_ender);
            if (data.Success) {
                this.Winner = this.Players[data.Winner];
                data.Name = this.Winner.NickName;
                this.Record();
                this.EmitAll('eog', data);
            }
        }
    }

    //Have a winner
    this.Finish = () => {
        this.Record();
        this.EmitAll('finish', {
            Name: this.Winner.NickName
        });
    }

    //All players gone
    this.End = () => {
        this.EmitAll('end', {
            Msg: 'All players gone'
        });
    }

    this.MoveTo = (_person, _fx, _fy, _tx, _ty) => {
        if (_person == this.Players[this.Board.Turn]) {
            var result = this.Board.MoveTo(_fx, _fy, _tx, _ty);
            this.SendMove(result);
            console.log(result);
            if (result.Winner !== null) {
                this.Winner = this.Players[result.Winner];
                this.Finish();
                if (this.DAIRoom) {
                    this.IsDAIRoom();
                }
                return;
            }
            if (!result.Success) {
                this.SendErrMsg(_person, result.ErrMsg);
            }
            if (result.Success) {
                this.SendMap();
                this.SendTurn();
            }
            if ((result.Success && this.AIRoom && !_person.AI) || (!result.Success && this.AIRoom && _person.AI)) {
                //AI think to MOVE
                this.AI.Next({
                    PrevMap: this.Board.HistoryMap[this.Board.HistoryMap.length - 1]
                }, (_data) => {
                    if (_data.Exist) {
                        this.MoveTo(this.AI, _data.Move.FX, _data.Move.FY, _data.Move.TX, _data.Move.TY);
                    } else {
                        this.EndOfTheGame(this.AI.Owner);
                    }
                });
            }
            if (this.DAIRoom) {
                //Double AI to Move
                if (this.Same()) {
                    this.IsDAIRoom();
                } else {
                    setTimeout(() => {
                        this.Players[this.Board.Turn].Next({
                            PrevMap: this.Board.HistoryMap[this.Board.HistoryMap.length - 1]
                        }, (_data) => {
                            if (_data.Exist) {
                                this.MoveTo(this.Players[this.Board.Turn], _data.Move.FX, _data.Move.FY, _data.Move.TX, _data.Move.TY);
                            } else {
                                this.EndOfTheGame(this.Players[this.Board.Turn].Owner);
                                this.IsDAIRoom();
                            }
                        });
                    }, 10000);
                }
            }
        }
    }

    this.Move_AI = () => {
        if (this.DAIRoom) {
            console.log('ReRunAI');
            this.Players[this.Board.Turn].Next({
                PrevMap: this.Board.HistoryMap[this.Board.HistoryMap.length - 1]
            }, (_data) => {
                if (_data.Exist) {
                    this.MoveTo(this.Players[this.Board.Turn], _data.Move.FX, _data.Move.FY, _data.Move.TX, _data.Move.TY);
                } else {
                    this.EndOfTheGame(this.Players[this.Board.Turn].Owner);
                }
            });
        }
    }

    this.IsDAIRoom = () => {
        this.Board = new B();
        this.Board.Init();
        this.Winner = null;
        if (this.AI1 !== null && this.AI2 !== null) {
            this.AI1.IAmAI();
            this.AI2.IAmAI();
        } else {
            this.AI1 = AI();
            this.AI2 = AI();
            this.Join(this.AI1);
            this.Join(this.AI2);
        }
        this.DAIRoom = true;
        this.Move_AI();
    }
}

module.exports = Room;