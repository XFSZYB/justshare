import { defineStore } from 'pinia'
import { getCurrentUUID, setCurrentUUID } from './helper'


export const useConnectStore = defineStore('connect-store', {
    state: () => {
        return {
            roomIds:[],
            createRoomLoading:false,
            currentUUID:getCurrentUUID(),
            roomList: [],
            userId: '',
            userName: '',
            roomsData: <any>[],
            peerInfo:{},
            inputFiles:'',
        }
    },
    actions: {
        setRoomIds(val:any){
            this.roomIds=val
        },
        setCreateRoomLoading (flag:boolean){
            this.createRoomLoading = flag
        },
        setInputFiles(inputFiles:string){
            this.inputFiles = inputFiles
        },
        setCurrentUUID(uuid:string){
            this.currentUUID = uuid 
            setCurrentUUID(uuid)
        },
        setPeerInfo(peerInfo:any){
            this.peerInfo = peerInfo
        },
        setUserId(userid: string) {
            this.userId = userid
        },
        setUserName(username: string) {
            this.userName = username
        },

        setRoomList(rooms: []) {
            this.roomList = rooms
            this.roomsData = this.getRoomList(rooms)
        },
        getRoomList(rooms: []) {
            console.log('initRoomsData====>',rooms)
            if(!rooms){
                return []
            }
            const tempList = rooms.map((item: any) => {
                const tempItem: any = {}
                tempItem.label = item.room_name
                tempItem.value = item.room_id
                return tempItem
            })
            console.log('tempList===>', tempList)
            return tempList
        },
        getRoomIdByName(name: string) {

        }
    }

})