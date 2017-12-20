//棋盤資訊
var Board = {
    Size: {
        Width: 9,
        Height: 10
    },
    Range: {
        From: {
            X: 0,
            Y: 0
        },
        To: {
            X: 8,
            Y: 9
        },
        Top: {
            From: {
                X: 0,
                Y: 0
            },
            To: {
                X: 8,
                Y: 4
            }
        },
        Bottom: {
            From: {
                X: 0,
                Y: 5
            },
            To: {
                X: 8,
                Y: 9
            }
        },
        King: {
            Top: {
                From: {
                    X: 3,
                    Y: 0
                },
                To: {
                    X: 5,
                    Y: 2
                }
            },
            Bottom: {
                From: {
                    X: 3,
                    Y: 7
                },
                To: {
                    X: 5,
                    Y: 9
                }
            }
        }
    }
}

//擁有者資訊
var OwnerId = {
    red: 1,
    black: 0,
    blue: 0,
    looker: 2,
    Red: 1,
    Black: 0,
    Blue: 0,
    Looker: 2
}

//擁有者名字
var OwnerName = {
    0: '藍棋',
    1: '紅棋',
    2: '觀戰者'
}

//棋子名字
var ChessName = {
    0: {
        0: '卒',
        1: '砲',
        2: '馬',
        3: '車',
        4: '象',
        5: '士',
        6: '將'
    },
    1: {
        0: '兵',
        1: '炮',
        2: '傌',
        3: '俥',
        4: '相',
        5: '仕',
        6: '帥'
    }
}

//棋子顏色
var ChessColor = {
    0: 'blue',
    1: 'red'
}

//棋子敵對的ID
var EnemyId = {
    0: 1,
    1: 0,
    2: 2
}

var MaxInt = Number.MAX_SAFE_INTEGER;
var MinInt = Number.MIN_SAFE_INTEGER;

module.exports = {
    OwnerId: OwnerId,
    Board: Board,
    ChessName: ChessName,
    ChessColor: ChessColor,
    EnemyId: EnemyId,
    OwnerName: OwnerName,
    MaxInt: MaxInt,
    MinInt: MinInt
};