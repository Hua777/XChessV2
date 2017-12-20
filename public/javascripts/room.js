(() => {

    var MoveData = null;

    var EnemyTurn = {
        0: 1,
        1: 0
    }

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

    var TurnSTO = null;
    var TurnCounter = 0;
    var IAM = null;
    var Map = null;

    var MovePos = {
        '1': {
            x: -1,
            y: -1
        },
        '0': {
            x: -1,
            y: -1
        }
    }

    var ChoosePos = {
        '1': {
            x: -1,
            y: -1
        },
        '0': {
            x: -1,
            y: -1
        }
    }

    var Min = (a, b) => {
        return a < b ? a : b;
    }

    var SetErrMsg = (_msg) => {
        var errMsgDiv = $('#errMsg');
        errMsgDiv.text(_msg);
        errMsgDiv.css({
            'margin-left': errMsgDiv.outerWidth() / 2 * -1,
            'margin-top': errMsgDiv.outerHeight() / 2 * -1
        });
        errMsgDiv.show();
        setTimeout(() => {
            errMsgDiv.fadeOut('slow', () => {});
        }, _msg.length * 125);
    }

    var GetMouseChessPos = (_canvas, _evt) => {
        var rect = _canvas.getBoundingClientRect();
        var X = _evt.clientX - rect.left;
        var Y = _evt.clientY - rect.top;
        var W = _canvas.width;
        var H = _canvas.height;
        var XW = W / 10;
        var YW = H / 11;
        X /= XW;
        Y /= YW;
        X--;
        Y--;
        X = Math.round(X);
        Y = Math.round(Y);
        var chess = null;
        var out = true;
        if (Map !== null && X >= 0 && X <= 8 && Y >= 0 && Y <= 9) {
            chess = Map[Y][X];
            out = false;
        }
        return {
            X: X,
            Y: Y,
            Chess: chess,
            Out: out
        }
    }

    var RotatePos180 = (_xy) => {
        if (_xy !== null) {
            return {
                X: 8 - _xy.X,
                Y: 9 - _xy.Y
            }
        }
        return null;
    }

    var RotateMapData180 = (_data) => {
        var tmpData = [];
        for (var i = 0, ii = 9; i < 10; i++, ii--) {
            tmpData[ii] = [];
            for (var j = 0, jj = 8; j < 9; j++, jj--) {
                tmpData[ii][jj] = _data[i][j];
            }
        }
        return tmpData;
    }

    var Draw3DMap = () => {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.shadowMap.enabled = true;

        var light = new THREE.DirectionalLight(new THREE.Color('rgb(255,255,255)'));
        var geometry = new THREE.SphereGeometry(5, 30, 60);
        const matertial = new THREE.MeshPhongMaterial({
            color: new THREE.Color('rgb(0,0,212)'),
        });

        const mesh = new THREE.Mesh(geometry, matertial);
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        mesh.position.set(0, 0, 0);


        renderer.setSize(640, 480)
        document.body.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(500, 640 / 480, 1, 10000);

        camera.position.y = 0.02;
        camera.position.z = 10;

        // scene.add(camera);
        scene.add(light);
        scene.add(mesh);

        renderer.render(scene, camera);

        function animate() {
            mesh.rotation.z += 0.05;
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.02;
            requestAnimationFrame(animate);

            renderer.render(scene, camera);
        }

        animate();
    }

    var DrawSpecial = (_ctx, _x, _y) => {
        var s = 5,
            l = 5;
        _ctx.beginPath();
        _ctx.lineWidth = 2;
        _ctx.strokeStyle = '#663b07';
        _ctx.moveTo(_x - s - l, _y - s);
        _ctx.lineTo(_x - s, _y - s);
        _ctx.lineTo(_x - s, _y - s - l);
        _ctx.moveTo(_x - s - l, _y + s);
        _ctx.lineTo(_x - s, _y + s);
        _ctx.lineTo(_x - s, _y + s + l);
        _ctx.moveTo(_x + s + l, _y - s);
        _ctx.lineTo(_x + s, _y - s);
        _ctx.lineTo(_x + s, _y - s - l);
        _ctx.moveTo(_x + s + l, _y + s);
        _ctx.lineTo(_x + s, _y + s);
        _ctx.lineTo(_x + s, _y + s + l);
        _ctx.stroke();
    }

    var DrawArrow = (_ctx, _fx, _fy, _tx, _ty, _sr) => {
        var headlen = 15;
        var angle = Math.atan2(_ty - _fy, _tx - _fx);
        _tx = _tx - _sr * Math.cos(angle);
        _ty = _ty - _sr * Math.sin(angle);
        _ctx.beginPath();
        _ctx.lineWidth = 5;
        _ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        _ctx.moveTo(_fx, _fy);
        _ctx.lineTo(_tx, _ty);
        _ctx.lineTo(_tx - headlen * Math.cos(angle - Math.PI / 6), _ty - headlen * Math.sin(angle - Math.PI / 6));
        _ctx.moveTo(_tx, _ty);
        _ctx.lineTo(_tx - headlen * Math.cos(angle + Math.PI / 6), _ty - headlen * Math.sin(angle + Math.PI / 6));
        _ctx.stroke();
    }

    var DrawMap = (_ctx) => {
        if ($(document).width() <= $(document).height()) {
            _ctx.canvas.width = $(document).width();
            _ctx.canvas.height = $(document).height();
        } else {
            _ctx.canvas.width = $(document).width() / 2;
            _ctx.canvas.height = $(document).height();
        }


        var XW = _ctx.canvas.width / 10,
            YW = _ctx.canvas.height / 11;
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        //邊框
        _ctx.beginPath();
        _ctx.fillStyle = '#5b3d07';
        _ctx.fillRect(0, 0, _ctx.canvas.width, YW);
        _ctx.fillRect(0, 10 * YW, _ctx.canvas.width, YW);
        _ctx.fillRect(0, 0, XW, _ctx.canvas.height);
        _ctx.fillRect(9 * XW, 0, XW, _ctx.canvas.height);
        _ctx.stroke();
        //中間面積
        _ctx.beginPath();
        _ctx.fillStyle = '#8e6316';
        _ctx.fillRect(1 * XW, 1 * YW, _ctx.canvas.width - 2 * XW, 9 * YW);
        _ctx.stroke();
        //線條
        _ctx.beginPath();
        _ctx.lineWidth = 2;
        _ctx.strokeStyle = '#5b3d07';
        for (var i = 0; i < 21; ++i) {
            _ctx.moveTo(0, i * YW);
            _ctx.lineTo(_ctx.canvas.width, i * YW);
        }
        for (var i = 0; i < 19; ++i) {
            _ctx.moveTo(i * XW, 0);
            _ctx.lineTo(i * XW, _ctx.canvas.height);
        }
        _ctx.moveTo(4 * XW, YW);
        _ctx.lineTo(6 * XW, 3 * YW);
        _ctx.moveTo(6 * XW, YW);
        _ctx.lineTo(4 * XW, 3 * YW);
        _ctx.moveTo(4 * XW, 8 * YW);
        _ctx.lineTo(6 * XW, 10 * YW);
        _ctx.moveTo(6 * XW, 8 * YW);
        _ctx.lineTo(4 * XW, 10 * YW);
        _ctx.stroke();
        //線條中長的像瞄準的號誌
        DrawSpecial(_ctx, 2 * XW, 3 * YW);
        DrawSpecial(_ctx, 8 * XW, 3 * YW);
        DrawSpecial(_ctx, 2 * XW, 8 * YW);
        DrawSpecial(_ctx, 8 * XW, 8 * YW);
        DrawSpecial(_ctx, 1 * XW, 4 * YW);
        DrawSpecial(_ctx, 3 * XW, 4 * YW);
        DrawSpecial(_ctx, 5 * XW, 4 * YW);
        DrawSpecial(_ctx, 7 * XW, 4 * YW);
        DrawSpecial(_ctx, 9 * XW, 4 * YW);
        DrawSpecial(_ctx, 1 * XW, 7 * YW);
        DrawSpecial(_ctx, 3 * XW, 7 * YW);
        DrawSpecial(_ctx, 5 * XW, 7 * YW);
        DrawSpecial(_ctx, 7 * XW, 7 * YW);
        DrawSpecial(_ctx, 9 * XW, 7 * YW);
        //楚河漢界
        _ctx.beginPath();
        _ctx.fillStyle = '#1e587f';
        _ctx.fillRect(XW, 5 * YW, _ctx.canvas.width - 2 * XW, YW);
        _ctx.fillStyle = 'black';
        _ctx.font = Min(XW / 2, YW / 2) + 'px 標楷體';
        _ctx.fillText('楚河漢界', _ctx.canvas.width / 2, _ctx.canvas.height / 2);
        _ctx.stroke();
        //棋子
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        var bigradius = Min(XW / 1.5, YW / 1.5);
        var smallradius = Min(XW / 2, YW / 2);
        if (Map !== null) {
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 9; j++) {
                    var x = (j + 1) * XW,
                        y = (i + 1) * YW;
                    if (Map[i][j] !== null) {
                        _ctx.beginPath();
                        _ctx.lineWidth = 3;
                        _ctx.strokeStyle = 'black';
                        if ((ChoosePos[1].X == j && ChoosePos[1].Y == i) || (ChoosePos[0].X == j && ChoosePos[0].Y == i)) {
                            _ctx.fillStyle = '#ffc768';
                            _ctx.arc(x, y, bigradius, 0, 2 * Math.PI);
                            _ctx.font = bigradius + 'px 標楷體';
                        } else {
                            _ctx.fillStyle = '#d89c31';
                            _ctx.arc(x, y, smallradius, 0, 2 * Math.PI);
                            _ctx.font = smallradius + 'px 標楷體';
                        }
                        _ctx.fill();
                        _ctx.fillStyle = Map[i][j].Color;
                        _ctx.fillText(Map[i][j].Name, x, y);
                        _ctx.stroke();
                    }
                    if ((MovePos[1].X == j && MovePos[1].Y == i) || (MovePos[0].X == j && MovePos[0].Y == i)) {
                        _ctx.beginPath();
                        _ctx.lineWidth = 1;
                        _ctx.strokeStyle = 'black';
                        if ((MovePos[1].X == j && MovePos[1].Y == i)) {
                            _ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                        } else {
                            _ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
                        }
                        _ctx.arc(x, y, smallradius, 0, 2 * Math.PI);
                        _ctx.fill();
                        _ctx.stroke();
                    }
                }
            }
        }
        //移動紀錄
        if (MoveData !== null) {
            DrawArrow(_ctx, (MoveData.FX + 1) * XW, (MoveData.FY + 1) * YW, (MoveData.TX + 1) * XW, (MoveData.TY + 1) * YW, smallradius);
        }
    }

    $(() => {

        var MAP = $('#map')[0];
        var CTXMAP = MAP.getContext('2d');
        var SOCKET = io.connect();
        var RumbleElem = $('#myName');

        RumbleElem.jrumble({
            x: 0,
            y: 0,
            rotation: 360
        });

        $(window).resize(() => {
            DrawMap(CTXMAP);
        });

        MAP.addEventListener('mousemove', (evt) => {
            if (IAM !== null && IAM.Owner != OwnerId['looker']) {
                var cp = GetMouseChessPos(MAP, evt);
                if (MovePos[IAM.Owner].X != cp.X || MovePos[IAM.Owner].Y != cp.Y) {
                    if (IAM.Owner == OwnerId['red']) {
                        cp = RotatePos180(cp);
                    }
                    cp.Owner = IAM.Owner;
                    SOCKET.emit('mp', cp);
                    MovePos[IAM.Owner] = cp;
                }
            }
        }, false);

        MAP.addEventListener('click', (evt) => {
            if (IAM !== null && IAM.Owner != OwnerId['looker']) {
                var cp = GetMouseChessPos(MAP, evt);
                if (cp.Chess !== null && cp.Chess.Owner == IAM.Owner) {
                    ChoosePos[IAM.Owner] = cp;
                } else if (ChoosePos[IAM.Owner].X !== -1 && ChoosePos[IAM.Owner].X !== undefined && !cp.Out) {
                    var fdata = {
                        X: ChoosePos[IAM.Owner].X,
                        Y: ChoosePos[IAM.Owner].Y
                    };
                    var tdata = {
                        X: cp.X,
                        Y: cp.Y
                    };
                    if (IAM.Owner == OwnerId['red']) {
                        fdata = RotatePos180(fdata);
                        tdata = RotatePos180(tdata);
                    }
                    SOCKET.emit('move', {
                        FX: fdata.X,
                        FY: fdata.Y,
                        TX: tdata.X,
                        TY: tdata.Y
                    });
                    ChoosePos[IAM.Owner] = {
                        X: -1,
                        Y: -1
                    };
                }
                var data = {
                    X: ChoosePos[IAM.Owner].X,
                    Y: ChoosePos[IAM.Owner].Y
                };
                if (IAM.Owner == OwnerId['red']) {
                    data = RotatePos180(data);
                }
                data.Owner = IAM.Owner;
                SOCKET.emit('cp', data);
            }
        }, false);

        SOCKET.emit('join', {
            RoomName: roomname,
            NickName: nickname,
            AI: ai
        });
        SOCKET.on('info', (data) => {
            IAM = data;
            if (IAM.Owner != OwnerId['looker']) {
                $('#byebye').show();
            }
            $('#name').text('你是' + IAM.OwnerName);
        });
        SOCKET.on('turn', (data) => {
            if (TurnSTO !== null) {
                clearInterval(TurnSTO);
            }
            if (IAM.Owner == data.Turn) {
                TurnSTO = setInterval(() => {
                    if (TurnCounter == 5) {
                        RumbleElem.trigger('startRumble');
                    }
                    TurnCounter++;
                }, 1000);
            } else {
                RumbleElem.trigger('stopRumble');
                TurnCounter = 0;
            }
            if (IAM.Owner == OwnerId['red']) {
                data.Turn = EnemyTurn[data.Turn];
            }
            if (data.Turn == OwnerId['red']) {
                $('#enemyName').removeClass('notnow');
                $('#enemyName').addClass('now');
                $('#myName').removeClass('now');
                $('#myName').addClass('notnow');
            } else {
                $('#enemyName').removeClass('now');
                $('#enemyName').addClass('notnow');
                $('#myName').removeClass('notnow');
                $('#myName').addClass('now');
            }
            DrawMap(CTXMAP);
        });
        SOCKET.on('players', (data) => {
            if (data.Changed == 1) {
                SetErrMsg('玩家加入');
            } else if (data.Changed == -1) {
                SetErrMsg('玩家退出');
            }
            if (data.Length == 2) {
                $('body').css('backgroundColor', 'yellow');
            } else {
                $('body').css('backgroundColor', 'white');
            }
            var eN = data.Names[1],
                mN = data.Names[0];
            if (IAM !== null && IAM.Owner == OwnerId['red']) {
                eN = data.Names[0];
                mN = data.Names[1];
            }
            $('#enemyName').text(eN);
            $('#myName').text(mN);
        });
        SOCKET.on('lookers', (data) => {
            if (data.Changed == 1) {
                SetErrMsg('觀戰者加入');
            } else if (data.Changed == -1) {
                SetErrMsg('觀戰者退出');
            }
            $('#lookerLen').text(data.Length);
        });
        SOCKET.on('map', (data) => {
            if (IAM !== null && IAM.Owner == OwnerId['red']) {
                Map = RotateMapData180(data);
            } else {
                Map = data;
            }
            DrawMap(CTXMAP);
        });
        SOCKET.on('mp', (data) => {
            if (IAM !== null && IAM.Owner == OwnerId['red']) {
                MovePos[data.Owner] = RotatePos180(data);
            } else {
                MovePos[data.Owner] = data;
            }
            DrawMap(CTXMAP);
        });
        SOCKET.on('cp', (data) => {
            if (IAM !== null && IAM.Owner == OwnerId['red']) {
                ChoosePos[data.Owner] = RotatePos180(data);
            } else {
                ChoosePos[data.Owner] = data;
            }
            DrawMap(CTXMAP);
        });
        SOCKET.on('move', (data) => {
            MoveData = data;
            if (MoveData.Success) {
                DrawMap(CTXMAP);
            }
        });
        SOCKET.on('finish', (data) => {
            alert('玩家[' + data.Name + ']獲勝');
            window.location.href = '/';
        });
        SOCKET.on('end', (data) => {
            alert('玩家中離');
            window.location.href = '/';
        });
        SOCKET.on('eog', (data) => {
            alert('玩家[' + data.Name + ']獲勝');
            window.location.href = '/';
        });
        SOCKET.on('msg', (data) => {
            SetErrMsg(data.ErrMsg);
        });

        $('#byebye').on('click', () => {
            var b = confirm('投降？');
            if (b) {
                SOCKET.emit('eog', {
                    Ender: IAM.Owner
                });
            }
        });

        $('#quit').on('click', () => {
            var b = confirm('離開？');
            if (b) {
                window.location.href = '/';
            }
        });
    });
})();