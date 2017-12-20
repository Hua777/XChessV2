# 目錄

[安裝](#安裝)

[使用](#使用)

[目錄文件說明](#目錄文件說明)

[關於一些數字](#關於一些數字)

[傳送至伺服器](#傳送至伺服器)

[從伺服器接收](#從伺服器接收)

# 安裝

    $ npm install

# 使用

    1. 在您的資料庫中，建立一個資料表名為 chessrecord。

    2. 建立資料表
    CREATE TABLE `chessrecord` (
        `cr_id` bigint(20) NOT NULL AUTO_INCREMENT,
        `cr_prevmap` text NOT NULL,
        `cr_nextmap` text NOT NULL,
        `cr_nextmove` text NOT NULL,
        `cr_wincount` bigint(20) NOT NULL,
        `cr_losecount` bigint(20) NOT NULL,
        PRIMARY KEY (`cr_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=16690 DEFAULT CHARSET=utf8 COMMENT='棋譜'

    3. 修改文件 _DB.js，使其得以連線到您的資料庫。

    4. $ node bin/www

# 目錄文件說明

### /bin

| 文件 | 說明 |
| ------ | ------ |
| bin | 伺服器、Socket 起始啟動點 |

### /public/images

網站相關圖片

| 文件 | 說明 |
| ------ | ------ |
| bg.png | 首頁背景圖 |
| icon.ico | 網站 icon |
| intro1.png | 首頁程序圖 |
| intro2.png | 首頁 AI 圖 |

### /public/javascripts

網站相關 js 文件

| 文件 | 說明 |
| ------ | ------ |
| index.js | 首頁 js |
| room.js | 房間 js |

### /public/stylesheets

網站相關 css 文件

| 文件 | 說明 |
| ------ | ------ |
| index.js | 首頁 css |
| room.js | 房間 css |

### /routes

| 文件 | 說明 |
| ------ | ------ |
| error.js | 錯誤路由 |
| INDEX.js | 首頁與房間相關路由 |

### /views

| 文件 | 說明 |
| ------ | ------ |
| index.ejs | 首頁版面 |
| message.ejs | 訊息版面，目前用於 404 |
| room.ejs | 房間版面 |

### /

| 文件 | 說明 |
| ------ | ------ |
| _DATA.js | 資料檔，獨立出來 |
| _FUNCTION.js | 函式檔，獨立出來 |
| app.js | 伺服器主要內容 |
| Chess.js | 棋子類 |
| Person.js | 玩家類 |
| Room.js | 房間類 |
| Board.js | 棋盤類 |
| AI.js | AI 類 |
| Evaluate.js | 評估函數 |
    
# Socket

Please use 

```
<script src="/socket.io/socket.io.js"></script>
var socket = io.connect();
```

to connect in client.

How to use: <https://socket.io/>

# 關於一些數字

```
Numbers: {
    藍Owner：0,
    紅Owner：1,
    藍Chess: {
        將: 6,
        士: 5,
        象: 4,
        車: 3,
        馬: 2,
        砲: 1,
        卒: 0
    },
    紅Chess: {
        帥: 6,
        仕: 5,
        相: 4,
        俥: 3,
        傌: 2,
        炮: 1,
        兵: 0
    }
}
```

# 傳送至伺服器

```
join { // 玩家加入房間
    RoomName: _String_, // 房間名。
    NickName: _String_, // 玩家暱稱。
    AI: _Boolean_       // true: 是 AI 房間，false: 不是 AI 房間。
}
``` 

```
move { // 玩家移動棋子
    FX: _Number_,   // 移動棋子 X 座標。
    FY: _Number_,   // 移動棋子 Y 座標。
    TX: _Number_,   // 目標位置 X 座標。
    TY: _Number_    // 目標位置 Y 座標。
}
```

```
cp { // 玩家點擊棋子座標
    X: _Number_,    // 點擊棋子 X 座標。
    Y: _Number_     // 點擊棋子 Y 座標。
}
```

``` 
mp { // 玩家目前滑鼠位置座標
    X: _Number_,    // 滑鼠 X 座標。
    Y: _Number_     // 滑鼠 Y 座標。
}
```

```
eog { // 玩家投降
    Ender: _Number_ // 投降的玩家 Owner，0 或 1，其值將從伺服器得到。
}
```

# 從伺服器接收

```
plen { // 在線玩家數量
    Length: _Number_    //數量。
}
```

```
rlist [ // 最新 10 間房間列表
    {
        PlayersLen: _Number_,   //房間玩家數量。
        Name: _String_          //房間名字。
    }, ...
]
```

```
info { // 玩家相關訊息
    OwnerName: _String_,    // 藍棋紅棋。
    Owner: _Number_,        // Owner，0 或 1。
    Name: _String_          // 名字。
}
```

```
turn { // 換誰下手
    Turn: _Number_  // Owner，0 或 1。
}
```

```
players { // 玩家資訊
    Length: _Number_,   // 此房間玩家數量。
    Names: {            // 玩家名字。
        0: _String_,    // Owner 為 0 的玩家名字。
        1: _String_     // Owner 為 1 的玩家名字。
    },
    Changed: _Number_   // 此次獲取資料玩家數量改變量。
}
```

```
lookers { // 觀戰者資訊
    Length: _Number_,   // 此房間觀戰者數量。
    Changed: _Number_   // 此次獲取資料觀戰者數量改變量。
}
```

```
map [ // 棋盤 二維陣列 9 * 10
    [{
        Owner: _Number_,    // 棋子的 Owner。
        Id = _Number_,      // 棋子的 Id 。
        Name = _String_,
        Color = _String_
    }, ...], ...
]
```

```
cp { // 玩家點擊棋子座標
    X: _Number_,    // 點擊棋子 X 座標。
    Y: _Number_     // 點擊棋子 Y 座標。
}
```

``` 
mp { // 玩家目前滑鼠位置座標
    X: _Number_,    // 滑鼠 X 座標。
    Y: _Number_     // 滑鼠 Y 座標。
}
```

```
move { // 玩家移動棋子
    FChess: _String_,   // 移動棋子的名字。
    TChess: _String_,   // 目的棋子的名字。
    FX: _Number_,       // 移動棋子 X 座標。
    FY: _Number_,       // 移動棋子 Y 座標。
    TX: _Number_,       // 目標位置 X 座標。
    TY: _Number_,       // 目標位置 Y 座標。
    Success: _Boolean_, // 移動是否成功。
    Winner: _Number_,   // 此次移動獲勝者 Owner。
    ErrMsg: _String_    // 錯誤訊息。
}
```

```
finish { // 玩家獲勝
    Name: _String_  // 獲勝者名字。
}
```

```
end { // 所有玩家中離
    Msg: 'All players gone'
}
```

```
eog { // 玩家投降
    Ender: _Number_ // 投降的玩家 Owner，0 或 1，其值將從伺服器得到。
}
```

```
msg { // 玩家移動錯誤
    ErrMsg: _String_    // 錯誤訊息。
}
```