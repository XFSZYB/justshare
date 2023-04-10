const url = `ws://127.0.0.1:8000/ws`
import GroupChatService, { SendingSliceName, ReceivingSliceName } from "../webrtc-group-chat-client";
// import { useChat } from '../views/chat/hooks/useChat'
import { useChatStore, useConnectStore, } from '@/store'
import {formatBytes} from '@/utils/format-bytes'


const updateConnectStore = () => {
    const connectStore = useConnectStore()
    return connectStore
    // connectStore.setRoomList(rooms)
}

const updateChatStore = () => {
    const chatStore = useChatStore()
    return chatStore
}

const fileMessageContainerBuilder = (
    authenticatedUserId: any,
    authenticatedUserName: any,
    isLocalSender: boolean,
    newTransceivingRelatedData: any
) => {
    // const newFileMessageContainer: any = {};
    let newFileMessageContent: any = {}
    console.log('newTransceivingRelatedData', newTransceivingRelatedData)
    console.log('isLocalSender', isLocalSender)
    if (isLocalSender) {
        const newSendingFileHashToAllSlices = newTransceivingRelatedData;

        Object.entries(newSendingFileHashToAllSlices).forEach(([fileHash, newAllSlices]: [string, any]) => {
            const id = `${authenticatedUserId}-${fileHash}`;


            let newFileMessage: any;

            let newFileProgress = newAllSlices[SendingSliceName.SENDING_MIN_PROGRESS];
            if (typeof newFileProgress !== "number") {
                newFileProgress = 0;
            }


            newFileMessage = {};
            newFileMessage.id = `${authenticatedUserId}-${fileHash}`;
            newFileMessage.userId = authenticatedUserId;
            newFileMessage.userName = authenticatedUserName;
            newFileMessage.fileHash = fileHash;
            // newFileMessage.timestamp = Date.parse(new Date());
            newFileMessage.timestamp = (new Date()).getTime()
            newFileMessage.isLocalSender = true;
            newFileMessage.fileSendingCanceller = () => {
                GroupChatService.cancelFileSendingToAllPeer(fileHash);
                // .cancelFileSendingToAllPeer(fileHash);
            };

            const newFileMetaData = {
                ...newAllSlices[SendingSliceName.SENDING_META_DATA],
            };
            newFileMessage.fileName = newFileMetaData.name;
            newFileMessage.fileSize = newFileMetaData.size;

            newFileMessage.isRead = true;
            newFileMessage.isNew = false;

            newFileMessage.fileProgress = newFileProgress;
            newFileMessageContent = { ...newFileMessage }
            // newFileMessageContainer[id] = newFileMessage;
        });

        // return newFileMessageContainer;
        return newFileMessageContent
    }

    const newReceivingPeerMapOfHashToAllSlices = newTransceivingRelatedData;

    newReceivingPeerMapOfHashToAllSlices.forEach((fileHashToAllSlices: any, peerId: any) => {
        Object.entries(fileHashToAllSlices).forEach(([fileHash, receivingAllSlices]: [string, any]) => {
            const id = `${peerId}-${fileHash}`;

            let newFileMessage: any;

            let newFileProgress = receivingAllSlices[ReceivingSliceName.RECEIVING_PROGRESS];
            if (typeof newFileProgress !== "number") {
                newFileProgress = 0;
            }

            newFileMessage = {};
            newFileMessage.id = `${peerId}-${fileHash}`;
            newFileMessage.userId = peerId;
            newFileMessage.userName = GroupChatService.getPeerNameById(peerId);
            newFileMessage.fileHash = fileHash;
            // newFileMessage.timestamp = Date.parse(new Date());
            newFileMessage.timestamp = (new Date()).getTime()
            newFileMessage.isLocalSender = false;

            const newFileMetaData = {
                ...receivingAllSlices[ReceivingSliceName.RECEIVING_META_DATA],
            };
            newFileMessage.fileName = newFileMetaData.name;
            newFileMessage.fileSize = newFileMetaData.size;

            newFileMessage.isRead = false;
            newFileMessage.isNew = true;


            newFileMessage.fileProgress = newFileProgress;
            newFileMessage.fileExporter = receivingAllSlices[ReceivingSliceName.RECEIVING_FILE_EXPORTER];
            newFileMessageContent = { ...newFileMessage }
            // newFileMessageContainer[id] = newFileMessage;
        });
    });

    // return newFileMessageContainer;
    return newFileMessageContent
};
export  const getReceivFileData = async (userid:string,filehash:string)=>{
 return  await  GroupChatService.fileCacheManager(userid,filehash)
}
export const sendTextMsg = (msg: string) => {
    GroupChatService.sendChatMessageToAllPeer(msg);
}
export const sendFileMsg = (files: File[]) => {
    GroupChatService.sendFileToAllPeer(files);
}
export const getConnectStatus = () => {
    return GroupChatService.getConnectStatus()
}
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
        console.warn('onRoomsInfoUpdated===>', rooms)
        updateConnectStore().setRoomList(rooms)
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
    const defaultMessage = {
        userId: "unknown user id",
        userName: "unknown user name",
        text: "unknown message",
    };
    if (message && typeof message.peerId === "string") {
        defaultMessage.userId = message.peerId;
    }
    if (message && typeof message.peerName === "string") {
        defaultMessage.userName = message.peerName;
    }
    if (message && typeof message.text === "string") {
        defaultMessage.text = message.text;
    }

    const timestamp = (new Date()).getTime();
    const id = `${defaultMessage.userId}-${timestamp}`;
    const textMessage = {
        id,
        timestamp,
        userId: defaultMessage.userId,
        userName: defaultMessage.userName,
        isLocalSender: false,
        text: defaultMessage.text,
        isRead: false,
        isNew: true,
    };

    updateChatStore().addChatByUuid(
        +updateConnectStore().currentUUID,
        {
            ...textMessage,
            dateTime: new Date().toLocaleString(),
            //   text: message,
            inversion: false,
            error: false,
            conversationOptions: null,
            requestOptions: { prompt: defaultMessage.text, options: null },
        },
    )
    // store.dispatch(receiveTextMessage(message));
});

GroupChatService.onPeersInfoChanged((peersInfo) => {
    console.log('onPeersInfoChanged==>', peersInfo)
    updateConnectStore().setPeerInfo(peersInfo)
    // store.dispatch(updateMembershipPeersInfo(peersInfo));
});


GroupChatService.onFileSendingRelatedDataChanged(
    (sendingRelatedDataProxy, isSendingStatusSending) => {
        console.warn('onFileSendingRelatedDataChanged===>', sendingRelatedDataProxy, isSendingStatusSending)
        if (isSendingStatusSending !== undefined) {
            // setIsSendingStatusSending(isSendingStatusSending);
        }
        if (sendingRelatedDataProxy && sendingRelatedDataProxy.fileHashToAllSlices) {
            const newMessageContainer = fileMessageContainerBuilder(
                updateConnectStore().userId,
                updateConnectStore().userName,
                true,
                sendingRelatedDataProxy.fileHashToAllSlices
            );
            let messageItem: any = { ...newMessageContainer }
            const isFileProgressValid =
                messageItem.fileProgress >= 0 &&
                messageItem.fileSize >= 0;
            const isFileProgressCompleted =
                isFileProgressValid && messageItem.fileProgress >= messageItem.fileSize;
            console.warn('--sendFileMsg--', newMessageContainer)
            if ( messageItem.fileProgress===0 ) {
                updateChatStore().addChatByUuid(
                    +updateConnectStore().currentUUID,
                    {
                        ...messageItem,
                        dateTime: new Date().toLocaleString(),
                        text: `文件名：${messageItem.fileName}
                        文件大小： ${formatBytes(messageItem.fileSize)}`,
                        // msgType: 'file',
                        inversion: true,
                        error: false,
                        loading:true,
                        fileLoading:true,
                        conversationOptions: null,
                        requestOptions: { prompt: messageItem.fileName, options: null },
                    },
                )
            } else if(isFileProgressCompleted) {
                updateChatStore().updateChatSomeByUuidAndChatid(
                    +updateConnectStore().currentUUID,
                    messageItem.id,
                    {
                        ...messageItem,
                        dateTime: new Date().toLocaleString(),
                        text: `文件名：${messageItem.fileName}
                        文件大小： ${formatBytes(messageItem.fileSize)}`,
                        // msgType: 'file',
                        inversion: true,
                        error: false,
                        loading:false,
                        fileLoading:false,
                        conversationOptions: null,
                        requestOptions: { prompt: messageItem.fileName, options: null },
                    },
                )
            }


        }
    }
);
GroupChatService.onFileReceivingRelatedDataChanged((receivingRelatedDataProxy) => {
    if (receivingRelatedDataProxy && receivingRelatedDataProxy.peerMapOfHashToAllSlices) {
        console.warn('==onFileReceivingRelatedDataChanged==', receivingRelatedDataProxy)
        const userId = updateConnectStore().userId
        const userName = updateConnectStore().userName

        const newMessageContainer = fileMessageContainerBuilder(
            userId,
            userName,
            false,
            receivingRelatedDataProxy.peerMapOfHashToAllSlices
        );
        console.warn('--recFileMsg--', newMessageContainer)
        let messageItem: any = { ...newMessageContainer }

        const isFileProgressValid =
            messageItem.fileProgress >= 0 &&
            messageItem.fileSize >= 0;
        const isFileProgressCompleted =
            isFileProgressValid && messageItem.fileProgress >= messageItem.fileSize;
        const isFileExporterCallable =
            isFileProgressCompleted && typeof messageItem.fileExporter === "function";

        if (isFileExporterCallable) {
            const handleFileExportSuccess = (file: any) => {
                console.warn('======file=====', file)
                if (file === undefined) {
                    alert("This cached file has been deleted, please let your peer send it again");
                    return;
                }
                if (file instanceof File === false) {
                    console.debug(
                        `FileTransceiver: unexpected type of params received from file Export handler`,
                        file
                    );
                    return;
                }
                const a: any = {}

                a.href = window.URL.createObjectURL(file);
                a.download = messageItem.fileName;
                console.warn('===tagA====', a)
                messageItem = { ...messageItem, ...a }
                updateChatStore().addChatByUuid(
                    +updateConnectStore().currentUUID,
                    {
                        ...messageItem,
                        dateTime: new Date().toLocaleString(),
                        text: messageItem.fileName,
                        msgType: 'file',
                        inversion: false,
                        error: false,
                        conversationOptions: null,
                        requestOptions: { prompt: messageItem.fileName, options: null },
                    },
                )
            };
            console.warn('===hello====')
            messageItem.fileExporter().then(handleFileExportSuccess).catch((e: any) => { console.error(e) });
        } 

    }
});