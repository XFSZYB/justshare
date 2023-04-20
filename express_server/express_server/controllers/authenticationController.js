const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const sessionController = require("./sessionController");
const websocketMap = sessionController.websocketMap;
const authenticatedUserIds = sessionController.authenticatedUserIds;
const signaling = require("../signaling/signaling");
const sendSignalThroughResponse = signaling.sendThroughResponse;
const signalTypeEnum = signaling.typeEnum;
const websocketController = require("./websocketController");
const sqlite3Controller = require('./sqliteController')
const util = require('../util')

exports.handleRegister = async (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(async function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    const userId = uuidv4();
    const userName = req.body.userName;
    const passwd = req.body.passwd
    const users = await sqlite3Controller.getUser(userName)
    if (users && users.length > 0) {
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        msg: 'user exist'
        // userId: userId,
      });
      return
    }
    const insertuser = await sqlite3Controller.createUser(userName, passwd, userId)
    req.session.userId = userId;
    req.session.username = userName;
    authenticatedUserIds.add(userId);

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        userId: userId,
      });
    });
  });


}

exports.handleLogin = (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(async function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    // const userId = uuidv4();
    const userName = req.body.userName;
    const passwd = req.body.passwd
    const userinfo = await sqlite3Controller.getUser(userName)
    if (!userinfo || userinfo.length === 0) {
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        // userId: userId,
        msg: 'not find user'
      });
      return
    }
    console.info('userinfo', userinfo)
    const user = userinfo.filter(item => { return item.user_name === userName && item.password === passwd })[0]
    if (!user || user.length === 0) {
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        msg: 'passwd error'
        // userId: userId,
      });
      return
    }
    req.session.userId = user.user_id;
    req.session.username = user.userName;
    // authenticatedUserIds.add(userId);

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        userId: user.user_id,
      });
    });
  });
};
exports.findUser = async (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(async function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    const username = req.query.username || '';
    console.info('?????==>',req.query)
    const user = await sqlite3Controller.getUser(username)
    if (!user || user.length === 0) {
      req.session.save(function (err) {
        if (err) return next(err);
        sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
          res: false,
          user: {},
          msg: 'not found user'
        });
      });
      return;
    }
    const userRes = user.map(item => { const newItem = { userName: item.user_name, userId: item.user_id }; return newItem })
    // const userIds = util.uniqueFunc(user,'user_id')
    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        res: true,
        user: userRes[0],
        msg: ''
      });
    });
  });

}
exports.handleMyCreateRoomids = async (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(async function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    const userId = req.query.userid || '';
    // console.info(req.query)
    const roomIds = await sqlite3Controller.getUserCreateRoom(userId)
    if (roomIds.length === 0) {
      req.session.save(function (err) {
        if (err) return next(err);
        sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
          roomIds,
        });
      });
      return;
    }
    // console.info('roomIds',roomIds)
    let handleRoomIds = util.uniqueFunc(roomIds, 'uuid')
    handleRoomIds = handleRoomIds.map(item => {
      return item.uuid
    })
    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        roomIds: handleRoomIds,
      });
    });
  });


}

exports.handleGetUserRoomIds = async (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(async function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    const userId = req.query.userid || '';
    // console.info(req.query)
    const roomIds = await sqlite3Controller.getUserAllJoinedRoom(userId)
    if (roomIds.length === 0) {
      req.session.save(function (err) {
        if (err) return next(err);
        sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
          roomIds,
        });
      });
      return;
    }
    // console.info('roomIds',roomIds)
    const handleRoomIds = util.uniqueFunc(roomIds, 'room_id')
    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        roomIds: handleRoomIds,
      });
    });
  });


}

exports.handleLogout = (req, res, next) => {
  const sessionUserId = req.session.userId;
  const sessionUserName = req.session.username;

  console.log(
    `[${chalk.green`HTTP`}] before logout action been executed, avaliable session are [${chalk.yellow`...`}]`
  );
  for (let userId of Array.from(websocketMap.keys())) {
    console.log(`[${chalk.yellow`${userId}`}]`);
  }

  // TODO:
  //
  // Priority Level: Low
  //
  // this 'session.destroy' method may be used incorrectly,
  // because 'req.session' regards each browser(eg: chrome, firefox ...) as one unique user,
  // as a result, when you log out inside a browser, no matter how many tabs you has opened inside that browser,
  // 'req.session' will think that they(tabs) log out
  //

  req.session.destroy(function () {
    if (sessionUserId && sessionUserId.length > 0) {
      authenticatedUserIds.delete(sessionUserId);

      if (websocketMap.has(sessionUserId)) {
        const ws = websocketMap.get(sessionUserId);
        websocketController.handleLeaveRoom(ws, sessionUserId);

        console.log(
          `[${chalk.green`WebSocket`}] will perform ${chalk.green`an active connection close`} to a user of a name(${chalk.green`${typeof sessionUserName === "string" ? sessionUserName : "unknown"
            }`})`
        );
      }
    }

    sendSignalThroughResponse(res, signalTypeEnum.LOG_OUT_SUCCESS);
  });
};
