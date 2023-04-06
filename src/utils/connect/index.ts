const url = `ws://127.0.0.1:8000/ws`
import GroupChatService from "../../webrtc-group-chat-client";



export const initConnect = (token: string, userName: string) => {
    GroupChatService.connect(`${url}?token=${token}&userName=${userName}`);
}

export const createRoom = (roomName: string) => {
    if (!roomName || roomName.length === 0) return;
    GroupChatService.createNewRoom(roomName);
}

export const joinRoom = (roomId: string) => {
    if (!roomId || roomId.length === 0) return;
    GroupChatService.joinRoom(roomId);
}

export const leaveRoom = (roomId: string) => {
    if (!roomId || roomId.length === 0) return;
    GroupChatService.leaveRoom();
}
// const iceServerUserName = env.TURN_SERVER_USER_NAME;
// const iceServerCredential = env.TURN_SERVER_CREDENTIAL;
// const iceServerUrls = JSON.parse(env.TURN_SERVER_URLS);

// GroupChatService.peerConnectionConfig = {
//   iceServers: [
//     {
//       username: iceServerUserName,
//       credential: iceServerCredential,
//       urls: iceServerUrls,
//     },
//   ],
// };
GroupChatService.onRoomsInfoUpdated((payload) => {
    const rooms = payload.rooms;
    if (rooms) {
        console.log('onRoomsInfoUpdated==>', rooms)
        //   store.dispatch(updateRoomList(rooms));
    }
});

GroupChatService.onJoinRoomInSuccess((payload) => {
    const roomId = payload.roomId;
    const roomName = payload.roomName;
    if (roomId.length > 0 && roomName.length > 0) {
        console.log('onJoinRoomInSuccess==>', payload)
        //   store.dispatch(updateJoinedRoomId({ roomId, roomName }));
        //   store.dispatch(updateRoomLoadingStatus(loadingStatusEnum.status.IDLE));
    }
});

GroupChatService.onLeaveRoomInSuccess((payload) => {
    console.log('onLeaveRoomInSuccess==>', payload)
    // store.dispatch(updateJoinedRoomId({ roomId: "", roomName: "" }));
    // store.dispatch(updateRoomLoadingStatus(loadingStatusEnum.status.IDLE));
});

GroupChatService.onWebRTCCallingStateChanged((isCalling) => {
    console.log('onWebRTCCallingStateChanged==>', isCalling)
    // store.dispatch(updateIsCalling(isCalling));
});

GroupChatService.onLocalAudioEnableAvaliableChanged((avaliable) => {
    console.log('onLocalAudioEnableAvaliableChanged==>', avaliable)
    // store.dispatch(updateAudioEnablingAvaliable(avaliable));
    // store.dispatch(updateAudioEnabling(GroupChatService.localMicEnabled));
});

GroupChatService.onLocalAudioMuteAvaliableChanged((avaliable) => {
    console.log('onLocalAudioMuteAvaliableChanged==>', avaliable)
    // store.dispatch(updateAudioMutingAvaliable(avaliable));
    // store.dispatch(updateAudioMuting(GroupChatService.localMicMuted));
});

GroupChatService.onLocalVideoEnableAvaliableChanged((avaliable) => {
    console.log('onLocalVideoEnableAvaliableChanged==>', avaliable)
    // store.dispatch(updateVideoEnablingAvaliable(avaliable));
    // store.dispatch(updateVideoEnabling(GroupChatService.localCameraEnabled));
});

GroupChatService.onLocalVideoMuteAvaliableChanged((avaliable) => {
    console.log('onLocalVideoMuteAvaliableChanged==>', avaliable)
    // store.dispatch(updateVideoMutingAvaliable(avaliable));
    // store.dispatch(updateVideoMuting(GroupChatService.localCameraMuted));
});

GroupChatService.onChatMessageReceived((message) => {
    console.log('onChatMessageReceived==>', message)
    // store.dispatch(receiveTextMessage(message));
});

GroupChatService.onPeersInfoChanged((peersInfo) => {
    console.log('onPeersInfoChanged==>', peersInfo)
    // store.dispatch(updateMembershipPeersInfo(peersInfo));
});
