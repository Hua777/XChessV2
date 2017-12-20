var E = require('./Evaluate.js');
var FS = require('fs');
var D = require('./_DATA.js');
var F = require('./_FUNCTION.js');

var N = process.argv[2];
var A = process.argv[3];
var B = process.argv[4];
var T = process.argv[5];
var D = process.argv[6];
var Depth = process.argv[6];

var Map = null;
var BadMap = [];

FS.readFile(__dirname + '/maps/' + N + '.map', function(_err, _data) {
    if (_err) {
        process.exit(0);
    } else {
        Map = JSON.parse(_data.toString());
        FS.readFile(__dirname + '/maps/' + N + '.badmap', function(_err2, _data2) {
            BadMap = JSON.parse(_data2.toString());
            var ab = AlphaBeta(A, B, null, T, D);
            console.log(JSON.stringify(ab));
            process.exit(0);
        });
    }
});

var AlphaBeta = (_alpha, _beta, _move, _turn, _depth) => {
    if (_depth == 0) {
        return {
            Value: E(Map, BadMap, _turn)
        };
    }
    var icanwalk = F.HowCanIWalk(Map, _turn);
    var rootkey = null;
    for (var i = 0; i < icanwalk.length; ++i) {
        var walk = icanwalk[i],
            fx = walk.FX,
            fy = walk.FY,
            tx = walk.TX,
            ty = walk.TY,
            fid = Map[fy][fx],
            tid = Map[ty][tx];

        //Move
        Map[ty][tx] = fid;
        Map[fy][fx] = 0;

        if (tid == 7 || tid == -7) {
            Map[fy][fx] = fid;
            Map[ty][tx] = tid;
            return {
                FX: fx,
                TX: tx,
                FY: fy,
                TY: ty,
                Value: D.MaxInt
            };
        } else {
            var value = -AlphaBeta(-_beta, -_alpha, {
                TId: tid,
                FId: fid,
                FX: fx,
                TX: tx,
                FY: fy,
                TY: ty
            }, F.EnemyOwner(_turn), _depth - 1).Value;

            //UnMove
            Map[fy][fx] = fid;
            Map[ty][tx] = tid;

            if (value >= _beta) {
                return {
                    FX: fx,
                    FY: fy,
                    TX: tx,
                    TY: ty,
                    Value: _beta
                };
            }
            if (value > _alpha) {
                _alpha = value;
                if (Depth == _depth) {
                    rootkey = {
                        FX: fx,
                        FY: fy,
                        TX: tx,
                        TY: ty,
                        Value: _alpha
                    };
                }
            }
        }
    }
    if (Depth == _depth) {
        if (rootkey === null) {
            return false;
        }
        return rootkey;
    }
    return {
        FX: fx,
        FY: fy,
        TX: tx,
        TY: ty,
        Value: _alpha
    };
}