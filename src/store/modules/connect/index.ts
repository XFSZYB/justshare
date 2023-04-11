import { defineStore } from 'pinia'
import { getCurrentUUID, setCurrentUUID } from './helper'


export const useConnectStore = defineStore('connect-store', {
    state: () => {
        return {
            currentUUID:getCurrentUUID(),
            roomList: {},
            userId: '',
            userName: '',
            roomsData: <any>[],
            peerInfo:{},
            inputFiles:'',
        }
    },
    actions: {
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

        setRoomList(rooms: object) {
            this.roomList = rooms
            this.roomsData = this.getRoomList(rooms)
        },
        getRoomList(rooms: object) {
            console.log('initRoomsData====>',rooms)
            if(!rooms){
                return []
            }
            const tempList = Object.values(rooms).map((item: any) => {
                const tempItem: any = {}
                tempItem.label = item.name
                tempItem.value = item.id
                return tempItem
            })
            console.log('tempList===>', tempList)
            return tempList
        },
        getRoomIdByName(name: string) {

        }
    }

})