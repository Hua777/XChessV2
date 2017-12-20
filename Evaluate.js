var F = require('./_FUNCTION.js');
var D = require('./_DATA.js');
var DB = require('./_DB.js');

var Chess0Value = [
    [ //卒
        [9, 9, 9, 11, 13, 11, 9, 9, 9],
        [19, 24, 34, 42, 44, 42, 34, 24, 19],
        [19, 24, 32, 37, 37, 37, 32, 24, 19],
        [19, 23, 27, 29, 30, 29, 27, 23, 19],
        [14, 18, 20, 27, 29, 27, 20, 18, 14],
        [7, 0, 13, 0, 16, 0, 13, 0, 7],
        [7, 0, 7, 0, 15, 0, 7, 0, 7],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [ //砲

        [150, 150, 144, 137, 135, 137, 144, 150, 150],
        [147, 147, 144, 138, 134, 138, 144, 147, 147],
        [146, 146, 144, 137, 138, 137, 144, 146, 146],
        [144, 149, 149, 147, 150, 147, 149, 149, 144],
        [144, 144, 144, 144, 150, 144, 144, 144, 144],
        [143, 144, 149, 144, 150, 144, 149, 144, 143],
        [144, 144, 144, 144, 144, 144, 144, 144, 144],
        [146, 144, 150, 149, 101, 149, 150, 144, 146],
        [144, 146, 147, 147, 147, 147, 147, 146, 144],
        [144, 144, 146, 149, 149, 149, 146, 144, 144]
    ],
    [ //馬
        [90, 90, 90, 96, 90, 96, 90, 90, 90],
        [90, 96, 103, 97, 94, 97, 103, 96, 90],
        [92, 98, 99, 103, 99, 103, 99, 98, 92],
        [93, 108, 100, 107, 100, 107, 100, 108, 93],
        [90, 100, 99, 103, 104, 103, 99, 100, 90],
        [90, 98, 101, 102, 103, 102, 101, 98, 90],
        [92, 94, 98, 95, 98, 95, 98, 94, 92],
        [93, 92, 94, 95, 92, 95, 94, 92, 93],
        [85, 90, 92, 93, 78, 93, 92, 90, 85],
        [88, 85, 90, 88, 90, 88, 90, 85, 88]
    ],
    [ //車
        [206, 208, 207, 213, 214, 213, 207, 208, 206],
        [206, 212, 209, 216, 233, 216, 209, 212, 206],
        [206, 208, 207, 214, 216, 214, 207, 208, 206],
        [206, 213, 213, 216, 216, 216, 213, 213, 206],
        [208, 211, 211, 214, 215, 214, 211, 211, 208],
        [208, 212, 212, 214, 215, 214, 212, 212, 208],
        [204, 209, 204, 212, 214, 212, 204, 209, 204],
        [198, 208, 204, 212, 212, 212, 204, 208, 198],
        [200, 208, 206, 212, 200, 212, 206, 208, 200],
        [194, 206, 204, 212, 200, 212, 204, 206, 194]
    ],
    [ //象
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [18, 0, 0, 0, 23, 0, 0, 0, 18],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 20, 0, 0, 0, 20, 0, 0]
    ],
    [ //士
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0],
        [0, 0, 0, 0, 23, 0, 0, 0, 0],
        [0, 0, 0, 20, 0, 20, 0, 0, 0]
    ],
    [ //將
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0],
        [0, 0, 0, 8888, 8888, 8888, 0, 0, 0]
    ]
];

var Chess1Value = [];

for (var i = 0; i < Chess0Value.length; ++i) {
    Chess1Value[i] = F.RotateMap180(Chess0Value[i]);
}

var ChessValue = [Chess0Value, Chess1Value];

var Evaluate = (_map, _badmaps, _turn) => {
    var value = 0;
    for (var i = 0; i < D.Board.Size.Height; i++) {
        for (var n = 0; n < D.Board.Size.Width; n++) {
            var id = _map[i][n];
            if (id != 0) {
                var nid = Math.abs(id) - 1;
                value += ChessValue[F.ConvertChessSMIdToOwner(id)][nid][i][n];
            }
        }
    }
    var tmpmap = _map;
    if (_turn == D.OwnerId['red']) {
        tmpmap = F.RotateMap180(tmpmap);
    }
    var strmap = JSON.stringify(tmpmap);
    var bad = 0;
    if (strmap in _badmaps) {
        bad = _badmaps[strmap].LoseRate * 100;
        //console.log(_turn + ' : ' + (value * F.TurnOneOrNOne(_turn) - bad) + '(' + value * F.TurnOneOrNOne(_turn) + ')(' + bad + ')');
    }
    value -= bad + Math.floor(Math.random() * 10);
    return value * F.TurnOneOrNOne(_turn);
}

module.exports = Evaluate;