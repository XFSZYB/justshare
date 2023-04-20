const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const websocketMap = require("./sessionController").websocketMap;
const rooms = require("./groupChatRoomController").rooms;
const userRoomMap = require("./groupChatRoomController").userRoomMap;
const GroupChatRoom = require("../models/groupChatRoom");
const signaling = require("../signaling/signaling");
const signalTypeEnum = signaling.typeEnum;
const findSignalTypeNameByTypeValue = signaling.findTypeNameByTypeValue;
const sendSerializedSignalThroughWebsocket = signaling.sendThroughWebsocket;
const sessionParser = require("./sessionController").sessionParser;
const authenticatedUserIds = require("./sessionController").authenticatedUserIds;
const sqlite3Controller = require('./sqliteController')
const chalk = require("chalk");
const util = require('../util');

const pingInterval = 30 * 1000;

const wss = new WebSocket.Server({ noServer: true });

const handleParams = (data) => {
  const res = {}
  const paramArr = data.split('&');
  paramArr.forEach(item => {
    const itemArr = item.split('=');
    const key = itemArr[0];
    const value = itemArr[1];
    res[key] = value;
  })
  return res
}

wss.on("connection", function (ws, request, client) {
  const pathname = request.url;
  // console.log('request.session', request.session, request.url)
  if (/token/.test(pathname) && !request.session) {
    const data = pathname.substr(4)
    const params = handleParams(data)
    request.session = {}
    // console.log('request.session',request.session)
    request.session.userId = params['token']
    request.session.username = params['userName']
  }


  handleWebSocketConnection(ws, request.session, websocketMap);
});

const pingIntervalID = setInterval(function ping() {
  // console.info('ping===>', rooms, userRoomMap)
  wss.clients.forEach(function each(ws) {
    8
    // console.info('checkout===', ws.isAlive)
    if (ws.isAlive === false) {
      // ws.terminate();
      return;
    }
    ws.isAlive = false;
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.PING);
  });
}, pingInterval);
wss.on("close", function close() {
  clearInterval(pingIntervalID);
});

exports.handleUpgrade = (request, socket, head) => {
  console.log(`[${chalk.green`HTTP`}] heard ${chalk.green`websocket upgrade`} event`);

  const pathname = request.url;

  if (pathname === "/" || /token/.test(pathname)) {
    if (/token/.test(pathname) && !request.session) {
      const data = pathname.substr(4)
      const params = handleParams(data)
      request.session = {}
      request.session.userId = params['token']
      request.session.username = params['userName']
    }

    sessionParser(request, {}, function next() {
      if (!authenticatedUserIds.has(request.session.userId,)) {
        console.log(
          `[${chalk.yellow`HTTP`}] ${chalk.yellow`websocket upgrade`} event ${chalk.yellow`ignored`} beacause of the unauthorized id(${request.session.userId
          })`
        );
        // handleUnauthorized(ws)
        // console.log(socket)
        // socket.write({'status':'fail'})
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, function (ws) {
        console.log(
          `[${chalk.green`HTTP`}] ${chalk.green`websocket upgrade`} event has passed checking, will emit a websocket ${chalk.yellow`connection`} event`
        );

        wss.emit("connection", ws, request);
      });
    });
  } else {
    console.log(
      `[${chalk.yellow`HTTP`}] ${chalk.yellow`websocket upgrade`} event ${chalk.yellow`ignored`} beacause of the wrong path(${pathname})`
    );

    socket.destroy();
    return;
  }
};

const handleWebSocketConnection = (ws, session, websocketMap) => {
  if (!ws || !session || !websocketMap) {
    console.log(`${chalk.red`[WebSocket] unexpected connection event`}`);
    return;
  }

  const sessionUserName = session.username;
  const sessionUserId = session.userId;

  console.log(
    `[${chalk.green`WebSocket`}] ${chalk.green`connection`} event ${chalk.blue`from`} a user of a name(${chalk.green`${sessionUserName ? sessionUserName : "unknown"
      }`})`
  );

  if (!sessionUserId || !sessionUserName) {
    return;
  }

  websocketMap.set(sessionUserId, ws);

  ws.userId = sessionUserId;
  ws.username = sessionUserName;
  ws.isAlive = true;

  ws.on("message", (data) => {
    console.warn('data===>', data)
    if (!authenticatedUserIds.has(sessionUserId)) {
      // handleUnauthorized(ws)
      // ws.close()
      // handleWebSocketMessage(ws, sessionUserName, sessionUserId, data);
      // return;
    } else {
      handleWebSocketMessage(ws, sessionUserName, sessionUserId, data);
    }

  });
  ws.on("close", (code, reason) => {
    handleWebSocketClose(code, reason, ws, sessionUserName, sessionUserId);
  });
};

const handleWebSocketMessage = (ws, sessionUserName, sessionUserId, data) => {
  const parsedMessage = JSON.parse(data);
  const type = parsedMessage.type;
  const payload = parsedMessage.payload;

  const signalTypeName = findSignalTypeNameByTypeValue(type);
  console.log(
    `[${chalk.green`WebSocket`}] ${chalk.green`${signalTypeName}`} signal msg ${chalk.blue`from`} a user(${chalk.green`${sessionUserId}`}) of a name(${chalk.green`${sessionUserName ? sessionUserName : "unknown"
      }`})`
  );

  switch (type) {
    case signalTypeEnum.UNAUTHORIZED: {
      handleUnauthorized(ws)
    }
    case signalTypeEnum.PONG: {
      handlePong(ws, sessionUserId, sessionUserName);
      break;
    }
    case signalTypeEnum.CREATE_ROOM: {
      handleCreateRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalTypeEnum.JOIN_ROOM: {
      handleJoinRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalTypeEnum.INVITE_USER_JOIN_ROOM: {
      handleInvite(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalTypeEnum.LEAVE_ROOM: {
      handleLeaveRoom(ws, sessionUserId, sessionUserName);
      break;
    }
    case signalTypeEnum.WEBRTC_NEW_PASSTHROUGH: {
      handleWebRTCNewPassthrough(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    default:
      break;
  }
};

const handleWebSocketClose = (code, reason, ws, sessionUserName, sessionUserId) => {
  console.log(
    `[${chalk.green`WebSocket`}] heard ${chalk.green`close`} event (code: ${chalk.green`${code ? code : "unknown close code"
      }`}, reason: ${chalk.green`${reason ? reason : "unknown close reason"
        }`}) ${chalk.blue`from`} the user of a name(${chalk.green`${sessionUserName}`})`
  );

  websocketMap.delete(sessionUserId);
};

const handleUnauthorized = (ws) => {
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UNAUTHORIZED, {
    stauts: 'fail'
  });
}

const handlePong = (ws, sessionUserId, sessionUserName) => {
  if (ws.isAlive) {
    // ignore it when received a 'PONG' without ever sending a 'PING'
    return;
  }
  ws.isAlive = true;
};

const handleCreateRoom = async (ws, sessionUserName, sessionUserId, payload) => {
  const roomId = uuidv4();
  if (!payload.roomName) {
    return
  }
  const createRoom = await sqlite3Controller.createRoom(payload.roomName, roomId, 0, sessionUserId)
  console.log('why')
  const joinroom = await sqlite3Controller.joinRoom(roomId, sessionUserId)
  console.log('are')
  // const room = new GroupChatRoom(roomId, payload.roomName);
  // room.addParticipant(sessionUserId, sessionUserName);
  // rooms[roomId] = room;
  //
  // When a new GroupChatRoom is created,
  // broadcast the latest rooms info to each client
  //
  const roomIds = await sqlite3Controller.getUserAllJoinedRoom(sessionUserId)
  // if (roomIds.length === 0) {
  // req.session.save(function (err) {
  //   if (err) return next(err);
  //   sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
  //     roomIds,
  //   });
  // });
  // return;
  // }
  console.info('roomIds', roomIds)
  const handleRoomIds = util.uniqueFunc(roomIds, 'room_id')
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UPDATE_ROOMS, {
    rooms: handleRoomIds,
    type: 'create',
    roomId,
    roomName: payload.roomName
  });
  // websocketMap.forEach((ws, userId) => {
  //   if (ws.readyState === WebSocket.OPEN) {
  //     sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UPDATE_ROOMS, {
  //       rooms: handleRoomIds,
  //       type: 'create',
  //       roomId,
  //       roomName: payload.roomName
  //     });
  //   }
  // });
  //
  // after broadcasting, make the client
  // who creates the new GroupChatRoom to join it first right now
  //
  // userRoomMap.set(sessionUserId, roomId);
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.JOIN_ROOM_SUCCESS, {
    roomId: roomId,
    roomName: payload.roomName,
  });
};
const handleInvite = async (ws, sessionUserName, sessionUserId, payload) => {
  const userId = payload.userId;

  const roomAdmin = payload.roomAdmin;
  const roomId = payload.roomId
  let userName = ''
  // let jionRes = true
  // let msg = ''
  console.log('handleInvite==>', userId, roomAdmin, roomId)
  if (sessionUserId !== roomAdmin) {
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.INVITE_USER_JOIN_ROOM_RES, {
      jionRes: false,
      msg: 'you are not admin'
    });
    return
  }
  
  const checkUsersId = await sqlite3Controller.getUserById(userId)
  console.log('checkpoint1==>',checkUsersId)
  if (!checkUsersId || checkUsersId.length === 0) {
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.INVITE_USER_JOIN_ROOM_RES, {
      jionRes: false,
      msg: 'not found'
    });
    return
  }
  userName = checkUsersId[0].user_name
  const checkRoomAdminOfRoomId = await sqlite3Controller.getRoomByRoomIdandUserId(roomId, roomAdmin)
  console.log('checkpoint2==>',checkRoomAdminOfRoomId)
  if (!checkRoomAdminOfRoomId || checkRoomAdminOfRoomId.length===0) {
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.INVITE_USER_JOIN_ROOM_RES, {
      jionRes: false,
      msg: 'not found'
    });
  }

  await handleJoinRoom(ws, userName, userId, { roomId, invite: true })
}
const handleJoinRoom = async (ws, sessionUserName, sessionUserId, payload) => {
  const joinedRoomId = payload.roomId;
  const joinedRoom = await sqlite3Controller.getRoom(joinedRoomId)
  if (!joinedRoom || joinedRoom.length === 0) return;
  console.info('test===>', sessionUserId,joinedRoomId,joinedRoom)
  const roomData = joinedRoom[0]
  const joinedRoomCheck = await sqlite3Controller.joinedRoomCheck(joinedRoomId, sessionUserId)
  if (!joinedRoomCheck) {
    return
  }
  console.log('joinedRoomCheck', joinedRoomCheck)
  if (joinedRoomCheck.length === 0) {
    const joinroom = await sqlite3Controller.joinRoom(payload.roomId, sessionUserId)
  }
  if (payload.invite) {
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.INVITE_USER_JOIN_ROOM_RES, {
      jionRes: true,
      msg: ''
    });
  } else {
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.JOIN_ROOM_SUCCESS, {
      roomId: roomData.room_id,
      roomName: roomData.room_name,
    });
  }


  const tempParticipants = await sqlite3Controller.getGroupRoom(payload.roomId)

  const participants = util.uniqueFunc(tempParticipants, 'user_id')
  console.info('tempParticipants', participants)
  if (!payload.invite && participants.size <= 1) {
    return;
  }

  const otherParticipantUserContainer = {};
  participants.forEach((item) => {
    if (payload.invite && sessionUserId === item.user_id) {
      const othersWebsocket = websocketMap.get(item.user_id);
      sendSerializedSignalThroughWebsocket(othersWebsocket, signalTypeEnum.INVITE_USER_JOIN_ROOM_RES, {
        jionRes: true,
        msg: '',
        isInvite: payload.invite,
        roomId: payload.roomId,
        roomName: roomData.room_name,
      });

    }

    if (!payload.invite && item.user_id !== sessionUserId) {
      const othersWebsocket = websocketMap.get(item.user_id);
      sendSerializedSignalThroughWebsocket(othersWebsocket, signalTypeEnum.WEBRTC_NEW_PEER_ARIVAL, {
        userId: sessionUserId,
        userName: sessionUserName,
        isPolite: false,
        // isInvite:payload.invite && sessionUserId === item.user_id,
        // roomId:payload.roomId        
      });
      otherParticipantUserContainer[item.user_id] = item.user_name;
    }

  })
  if (payload.invite) {
    return
  }
  console.info('otherParticipantUserContainer', otherParticipantUserContainer)

  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.WEBRTC_NEW_PEER_ARIVAL, {
    userContainer: otherParticipantUserContainer,
    isPolite: true,
  });
};

const handleLeaveRoom = (ws, sessionUserId, sessionUserName) => {
  const leftRoomId = userRoomMap.get(sessionUserId);
  const leftRoom = rooms[leftRoomId];

  if (!leftRoom) {
    console.log(
      `[${chalk.yellow`WebSocket`}] handleLeaveRoom failed for the user of a name(${chalk.yellow`${sessionUserName ? sessionUserName : "unknown"
        }`}), because left room not existed`
    );
    return;
  }

  userRoomMap.delete(sessionUserId);
  leftRoom.deleteParticipant(sessionUserId);
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.LEAVE_ROOM_SUCCESS, {
    roomId: leftRoomId,
    roomName: leftRoom.name,
    userId: sessionUserId,
  });

  leftRoom.participants.forEach((_, participantUserId) => {
    if (participantUserId !== sessionUserId) {
      const otherWebsocket = websocketMap.get(participantUserId);
      sendSerializedSignalThroughWebsocket(otherWebsocket, signalTypeEnum.WEBRTC_NEW_PEER_LEAVE, {
        userId: sessionUserId,
      });
    }
  });

  //
  // If this 'leftRoom' become an empty room, automatically delete it
  // and notify all authenticated clients
  //
  if (leftRoom.participants.size === 0) {
    delete rooms[leftRoomId];
    console.log(
      `[${chalk.green`WebSocket`}] ${chalk.green`deleted`} a room(id:${chalk.green`${leftRoom.id}`}, name:${chalk.green`${leftRoom.name}`}), because of its participants size(${chalk.green`${leftRoom.participantsSize}`})`
    );
    websocketMap.forEach((ws, _) => {
      if (ws.readyState === WebSocket.OPEN) {
        sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UPDATE_ROOMS, {
          rooms: rooms,
        });
      }
    });
  }
};

const handleWebRTCNewPassthrough = (ws, sessionUserName, sessionUserId, payload) => {

  if (!payload.to) return;
  const websocketToPassThrough = websocketMap.get(payload.to);
  const { sdp, iceCandidate } = payload;

  if ((sdp || iceCandidate) && websocketToPassThrough) {
    console.log(
      `[${chalk.green`WebSocket`}] ${chalk.green`WEBRTC_NEW_PASSTHROUGH`} signal msg of type ${chalk.green`${sdp && iceCandidate
        ? "unexpected payload"
        : sdp
          ? sdp.type
          : iceCandidate
            ? "ICE"
            : "unknown"
        }`} ${chalk.blue`from`} the user of a name(${chalk.green`${sessionUserName}`}) ${chalk.blue`to`} the user of a name(${chalk.green`${websocketToPassThrough.username ? websocketToPassThrough.username : "unknown"
          }`})`
    );
    sendSerializedSignalThroughWebsocket(
      websocketToPassThrough,
      signalTypeEnum.WEBRTC_NEW_PASSTHROUGH,
      {
        ...payload,
        from: sessionUserId,
      }
    );
  }
};

exports.handleLeaveRoom = handleLeaveRoom;
