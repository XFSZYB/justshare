const fs = require("fs");
const path = require("path");
const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database(path.resolve(__dirname, "../database/db.db"));


async function initDB() {

    db.serialize(async () => {
        try {
            db.run("CREATE TABLE IF NOT EXISTS userinfo ( id INTEGER PRIMARY KEY AUTOINCREMENT, user_name VARCHAR (30) NOT NULL, password VARCHAR (60) NOT NULL, create_time  VARCHAR (60) NOT NULL,user_id VARCHAR (60) NOT NULL);");
            db.run("CREATE TABLE IF NOT EXISTS roominfo ( id INTEGER PRIMARY KEY AUTOINCREMENT, room_name VARCHAR (30) NOT NULL, create_time  VARCHAR (60) NOT NULL,room_id VARCHAR (60) NOT NULL, type INTEGER NOT NULL ,created_user_id VARCHAR (60) NOT NULL);");
            db.run("CREATE TABLE IF NOT EXISTS room_user_relation ( id INTEGER PRIMARY KEY AUTOINCREMENT, room_id VARCHAR (60) NOT NULL, user_id  VARCHAR (60) NOT NULL);")


            // const createUser1 = await createUser('admin', '21232f297a57a5a743894a0e4a801fc3', '21232f297a57a5a743894a0e4a801fc3')
            // const createUser2 = await createUser('admin2', 'c84258e9c39059a89ab77d846ddab909', 'c84258e9c39059a89ab77d846ddab909')

            // const createRoom1 = await createRoom('room1', '3ccabb59915d2d79c7f377fd9d35f9f4', 0, '21232f297a57a5a743894a0e4a801fc3')
            // const createRoom2 = await createRoom('room2', 'ae5a7c626ab26c684686572766f9885c', 0, 'c84258e9c39059a89ab77d846ddab909')

            // const joinRoom1 = await joinRoom('3ccabb59915d2d79c7f377fd9d35f9f4', '21232f297a57a5a743894a0e4a801fc3')
            // const joinRoom2 = await joinRoom('3ccabb59915d2d79c7f377fd9d35f9f4', 'c84258e9c39059a89ab77d846ddab909')

            // const joinRoom3 = await joinRoom('ae5a7c626ab26c684686572766f9885c', '21232f297a57a5a743894a0e4a801fc3')
            // const joinRoom4 = await joinRoom('ae5a7c626ab26c684686572766f9885c', 'c84258e9c39059a89ab77d846ddab909')

            // const allUser = await getAllUser()
            // const allRoom = await getAllRoom()

            // const userJoinedRoom = await getUserAllJoinedRoom('21232f297a57a5a743894a0e4a801fc3')
            // const groupRoom = await getGroupRoom()

            // const user = await getUser('admin')
            // const passw = await getPassword('admin')
            // console.info('createUser1', createUser1)
            // console.info('createUser2', createUser2)
            // console.info('createRoom1', createRoom1)
            // console.info('createRoom2', createRoom2)
            // console.info('joinRoom1', joinRoom1)
            // console.info('joinRoom2', joinRoom2)
            // console.info('joinRoom3', joinRoom3)
            // console.info('joinRoom4', joinRoom4)
            // console.info('allUser', allUser)
            // console.info('allRoom', allRoom)
            // console.info('userJoinedRoom', userJoinedRoom)
            // console.info('groupRoom', groupRoom)
            // console.info('user', user)
            // console.info('passw', passw)
        } catch (e) {
            console.error(e)
        }
    });


}


function createUser(user_name, password, user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const create_time = new Date();
            const stmt = db.prepare("INSERT INTO userinfo(user_name,password,create_time,user_id) VALUES (?,?,?,?);");
            stmt.run([user_name, password, create_time, user_id])
            stmt.finalize(function (err) {
                // console.info('err', err)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve()

            });
        });
    })
}

function createRoom(room_name, room_id, type, created_user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const create_time = new Date();
            const stmt = db.prepare("INSERT INTO roominfo(room_name,create_time,room_id,type,created_user_id) VALUES (?,?,?,?,?);");
            stmt.run([room_name, create_time, room_id, type, created_user_id])
            stmt.finalize(function (err) {
                // console.info('err', err)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve()

            });
        });
    })
}
function getRoom(room_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                const stmt = db.prepare("select * from  roominfo  where room_id=? ");
                stmt.all(room_id, function (err, rows) {
                    // console.info('err', err, rows)
                    if (null != err) {
                        reject([])
                        return
                    }
                    resolve(rows)
                })
                stmt.finalize()
            } catch (e) {
                console.info(e)
                reject([])
            }

        });
    })
}
function joinedRoomCheck(room_id, user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("select * from room_user_relation where room_id=? and user_id=?");
            stmt.all([room_id, user_id], function (err, rows) {
                // console.info('err', err, rows)
                if (null != err) {
                    reject([])

                }
                resolve(rows)

            })
            stmt.finalize();
        });
    })
}
function joinRoom(room_id, user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("INSERT INTO room_user_relation(room_id,user_id) VALUES (?,?);");
            stmt.run([room_id, user_id])
            stmt.finalize(function (err) {
                // console.info('err', err)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve()

            });
        });
    })
}

function leaveRoom() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const create_time = new Date();
            const stmt = db.prepare("INSERT INTO userinfo(user_name,password,create_time,user_id) VALUES (?,?,?,?);");
            stmt.run([user_name, password, create_time, user_id])
            stmt.finalize(function (err) {
                // console.info('err', err)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve()

            });
        });
    })
}

function getAllUserId() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all("select user_id from userinfo", function (err, rows) {
                // console.info('err',err,rows)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve(rows)

            });
        });
    })
}

function getUserCreateRoom(user_id){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                const stmt = db.prepare("select room_user_relation.room_id as uuid  from room_user_relation left join roominfo on room_user_relation.user_id=roominfo.created_user_id where user_id=? ");
                stmt.all(user_id, function (err, rows) {
                    // console.info('err', err, rows)
                    if (null != err) {
                        reject([])
                        return
                    }
                    resolve(rows)
                })
                stmt.finalize()
            } catch (e) {
                console.info(e)
                reject([])
            }

        });
    })
}

function getUserAllJoinedRoom(user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
         
                const stmt = db.prepare("select roominfo.room_id ,roominfo.room_name  from room_user_relation right join roominfo on  roominfo.room_id=room_user_relation.room_id   where  user_id=? GROUP BY room_user_relation.room_id");
                stmt.all(user_id, function (err, rows) {
                    console.info('err', err, rows)
                    if (null != err) {
                        reject([])
                        return
                    }
                    resolve(rows)
                })
                stmt.finalize()
        

        });
    })
}


function getGroupRoom(room_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                const stmt = db.prepare("select room_user_relation.room_id as id,userinfo.user_name ,userinfo.user_id  from room_user_relation left join userinfo on userinfo.user_id=room_user_relation.user_id where room_id=? ");
                stmt.all(room_id, function (err, rows) {
                    // console.info('err', err, rows)
                    if (null != err) {
                        reject([])
                        return
                    }
                    resolve(rows)
                })
                stmt.finalize()
            } catch (e) {
                console.info(e)
                reject([])
            }

        });
    })
}
function getAllRoom() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all("select room_id,room_name from roominfo", function (err, rows) {
                // console.info('err',err,rows)
                if (null != err) {
                    reject([])
                }
                resolve(rows)

            });
        });
    })
}
function getRoomByRoomIdandUserId(roomId, user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("select created_user_id  from roominfo where  room_id=? and created_user_id=?");
            stmt.all(roomId, user_id, function (err, rows) {
                // console.info('err', err, rows)
                if (null != err) {
                    reject([])
                    return
                }
                resolve(rows)
            })
            stmt.finalize()
        });
    })
}


function getUserById(user_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("select user_name, user_id  from userinfo where user_id=?");
            stmt.all(user_id, function (err, rows) {
                // console.info('err', err, rows)
                if (null != err) {
                    reject([])
                    return
                }
                resolve(rows)
            })
            stmt.finalize()
        });
    })
}


function getUser(user_name) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("select user_name, password, user_id  from userinfo where user_name=?");
            stmt.all(user_name, function (err, rows) {
                // console.info('err', err, rows)
                if (null != err) {
                    reject([])
                    return
                }
                resolve(rows)
            })
            stmt.finalize()
        });
    })
}

function getPassword(user_name) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare("select password from userinfo where user_name=?");
            stmt.run(user_name)
            stmt.finalize(function (err, rows) {
                // console.info('err',err,rows)
                if (null != err) {
                    reject(err)
                    err
                }
                resolve(rows)
            })
        });
    })
}

module.exports = {
    initDB,
    getPassword,
    getAllRoom,
    getAllUserId,
    getUserById,
    getUser,
    getRoom,
    getGroupRoom,
    getUserAllJoinedRoom,
    getUserCreateRoom,
    getRoomByRoomIdandUserId,
    createRoom,
    createUser,
    joinRoom,
    joinedRoomCheck,
    leaveRoom

}
