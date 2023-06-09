import {
  NewPeerLeavePayload,
  IncomingPassthrough,
  NewPeerArivalPayload,
  JoinRoomSuccessPayload,
  InviteUserJoinRoomPayload,
  UpdateRoomsPayload,
  LeaveRoomSuccessPayload,
  _SignalType,
} from "./common-types";
import SocketManager from "./socket-manager";

let _webSocketUrl: string | undefined;

let _handleWebSocketOpened: EventListener | undefined;
let _handleWebSocketClosed: EventListener | undefined;

let _handleJoinRoomSuccess: ((payload: JoinRoomSuccessPayload) => void) | undefined;
let _handleInviteUserJoinRoomRes: ((payload: InviteUserJoinRoomPayload) => void) | undefined;
let _handleRoomsUpdated: ((payload: UpdateRoomsPayload) => void) | undefined;
let _handleLeaveRoomSuccess: ((payload: LeaveRoomSuccessPayload) => void) | undefined;

let _handleNewPeerLeaved: ((payload: NewPeerLeavePayload) => void) | undefined;
let _handleNewPassthroughArival: ((payload: IncomingPassthrough) => void) | undefined;
let _handleNewPeerArivalInternally: ((payload: NewPeerArivalPayload) => void) | undefined;
let _handleUnauthorized: ((payload: any) => void) | undefined;
function _handleSocketOpen(event: Event) {
  console.debug("WebRTCGroupChatService: websocket connected");
  // external usage
  if (_handleWebSocketOpened) {
    _handleWebSocketOpened(event);
  }
}

function _handleSocketClose(event: Event) {
  console.debug("WebRTCGroupChatService: client side heared websocket onclose event");
  // external usage
  if (_handleWebSocketClosed) {
    _handleWebSocketClosed(event);
  }
}

function _handleSocketPing() {
  console.debug("WebRTCGroupChatService: PING signal received, will respond with PONG signal");
  if (!_webSocketUrl) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.PONG);
}

function _handleSocketUnauthorized(payload: any) {
  console.debug("Unauthorized");
  // external usage
  if (_handleUnauthorized) {
    _handleUnauthorized(payload);
  }
}

function _handleSocketUpdateRooms(payload: UpdateRoomsPayload) {
  console.debug("WebRTCGroupChatService: UPDATE_ROOMS signal received");
  // external usage
  if (_handleRoomsUpdated) {
    _handleRoomsUpdated(payload);
  }
}

function _handleSocketJoinRoomSuccess(payload: JoinRoomSuccessPayload) {
  console.debug("WebRTCGroupChatService: JOIN_ROOM_SUCCESS signal received");
  // external usage
  if (_handleJoinRoomSuccess) {
    _handleJoinRoomSuccess(payload);
  }
}
function _handleSocketInviteUserJoinRoomRes(payload: InviteUserJoinRoomPayload) {

  if (_handleInviteUserJoinRoomRes) {
    _handleInviteUserJoinRoomRes(payload)
  }
}


function _handleSocketLeaveRoomSuccess(payload: LeaveRoomSuccessPayload) {
  console.debug("WebRTCGroupChatService: LEAVE_ROOM_SUCCESS signal received");
  // external usage
  if (_handleLeaveRoomSuccess) {
    _handleLeaveRoomSuccess(payload);
  }
}

function _handleSocketNewWebRTCPeerArival(payload: NewPeerArivalPayload) {
  console.debug("WebRTCGroupChatService: WEBRTC_NEW_PEER signal received");
  // internal usage
  if (_handleNewPeerArivalInternally) {
    _handleNewPeerArivalInternally(payload);
  }
}

function _handleSocketNewWebRTCPassthroughArival(payload: IncomingPassthrough) {
  console.debug("WebRTCGroupChatService: WEBRTC_NEW_PASSTHROUGH signal received");
  // internal usage
  if (_handleNewPassthroughArival) {
    _handleNewPassthroughArival(payload);
  }
}

function _handleSocketNewWebRTCPeerLeave(payload: NewPeerLeavePayload) {
  console.debug("WebRTCGroupChatService: WEBRTC_NEW_PEER_LEAVE signal received");
  // internal usage
  if (_handleNewPeerLeaved) {
    _handleNewPeerLeaved(payload);
  }
}

function _connect() {
  if (!_webSocketUrl || _webSocketUrl.length === 0) {
    console.debug(
      `WebRTCSignalingManager: connecting failed because of WebSocket url`,
      _webSocketUrl
    );
    return;
  }

  SocketManager.createSocket(_webSocketUrl, _handleSocketOpen, _handleSocketClose);
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.UNAUTHORIZED,
    _handleSocketUnauthorized
  );
  SocketManager.registerMessageEvent(_webSocketUrl, _SignalType.PING, _handleSocketPing);
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.UPDATE_ROOMS,
    _handleSocketUpdateRooms
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.JOIN_ROOM_SUCCESS,
    _handleSocketJoinRoomSuccess
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.INVITE_USER_JOIN_ROOM_RES,
    _handleSocketInviteUserJoinRoomRes
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.LEAVE_ROOM_SUCCESS,
    _handleSocketLeaveRoomSuccess
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.WEBRTC_NEW_PEER_ARIVAL,
    _handleSocketNewWebRTCPeerArival
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.WEBRTC_NEW_PASSTHROUGH,
    _handleSocketNewWebRTCPassthroughArival
  );
  SocketManager.registerMessageEvent(
    _webSocketUrl,
    _SignalType.WEBRTC_NEW_PEER_LEAVE,
    _handleSocketNewWebRTCPeerLeave
  );
}

function _disconnect() {
  if (!_webSocketUrl || _webSocketUrl.length === 0) {
    return;
  }
  SocketManager.destroySocket(_webSocketUrl);
}

/**
 * Chat room
 */

function _createNewRoomSignaling(roomName: string) {
  if (!_webSocketUrl || _webSocketUrl.length === 0 || roomName.length === 0) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.CREATE_ROOM, {
    roomName: roomName,
  });
}

function _joinRoomSignaling(roomId: string) {
  if (!_webSocketUrl || _webSocketUrl.length === 0 || roomId.length === 0) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.JOIN_ROOM, {
    roomId: roomId,
  });
}

function _inviteUserJoinRoomSignaling(userId: string, roomAdmin: string, roomId: string) {
  if (!_webSocketUrl || _webSocketUrl.length === 0 || roomId.length === 0 || userId.length === 0 || roomAdmin.length === 0) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.INVITE_USER_JOIN_ROOM, {
    roomId: roomId,
    userId: userId,
    roomAdmin: roomAdmin
  });
}

function _leaveRoomSignaling() {
  if (!_webSocketUrl || _webSocketUrl.length === 0) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.LEAVE_ROOM, {});
}

/**
 * WebRTC peer connection
 */

function _passThroughSignaling(payload: unknown) {
  if (!_webSocketUrl || _webSocketUrl.length === 0) {
    return;
  }
  SocketManager.emitMessageEvent(_webSocketUrl, _SignalType.WEBRTC_NEW_PASSTHROUGH, payload);
}

export default {
  set webSocketUrl(url: string | undefined) {
    _webSocketUrl = url;
  },

  connect: function () {
    _connect();
  },
  disconnect: function () {
    _disconnect();
  },

  /**
   * external signaling
   */

  createNewRoomSignaling: function (roomName: string) {
    _createNewRoomSignaling(roomName);
  },
  joinRoomSignaling: function (roomId: string) {
    _joinRoomSignaling(roomId);
  },
  inviteUserJoinRoomSignaling: function (userId: string, roomAdmin: string, roomId: string) {
    _inviteUserJoinRoomSignaling(userId, roomAdmin, roomId);
  },
  leaveRoomSignaling: function () {
    _leaveRoomSignaling();
  },

  /**
   * internal signaling
   */

  passThroughSignaling: function (payload: unknown) {
    _passThroughSignaling(payload);
  },

  /**
   * external listeners
   */

  onWebSocketOpen: function (handler: EventListener) {
    _handleWebSocketOpened = handler;
  },
  onWebSocketClose: function (handler: EventListener) {
    _handleWebSocketClosed = handler;
  },
  onWebSocketUnauthorized: function (handle: (payload: any) => void) {
    _handleUnauthorized = handle
  },
  onJoinRoomInSuccess: function (handler: (payload: JoinRoomSuccessPayload) => void) {
    _handleJoinRoomSuccess = handler;
  },
  onInviteUserJoinRoomRes: function (handler: (payload: InviteUserJoinRoomPayload) => void) {
    _handleInviteUserJoinRoomRes = handler
  },
  onRoomsInfoUpdated: function (handler: (payload: UpdateRoomsPayload) => void) {
    _handleRoomsUpdated = handler;
  },
  onLeaveRoomInSuccess: function (handler: (payload: LeaveRoomSuccessPayload) => void) {
    _handleLeaveRoomSuccess = handler;
  },

  /**
   * internal listeners
   */

  onWebRTCNewPeerLeaved: function (handler: (payload: NewPeerLeavePayload) => void) {
    _handleNewPeerLeaved = handler;
  },
  onWebRTCNewPassthroughArival: function (handler: (payload: IncomingPassthrough) => void) {
    _handleNewPassthroughArival = handler;
  },
  onWebRTCNewPeerArivalInternally: function (handler: (payload: NewPeerArivalPayload) => void) {
    _handleNewPeerArivalInternally = handler;
  },
};
