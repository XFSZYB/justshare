const url = `ws://127.0.0.1:8000/ws`
import GroupChatService from "../../webrtc-group-chat-client";



export const initConnect = (token:string,userName:string) => {
    GroupChatService.connect(`${url}?token=${token}&userName=${userName}`);
}

export const createRoom = (roomName: string) => {
    if (!roomName || roomName.length === 0) return;
    GroupChatService.createNewRoom(roomName);
}

export const joinRoom =(roomId:string)=>{
    if (!roomId || roomId.length === 0) return;
    GroupChatService.joinRoom(roomId);
}

export const leaveRoom = (roomId:string)=>{
    if (!roomId || roomId.length === 0) return;
    GroupChatService.leaveRoom();
}
