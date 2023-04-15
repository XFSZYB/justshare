import { defineStore } from 'pinia'
import { getCurrentUUID, setCurrentUUID } from './helper'
import {uniqueFunc} from '@/utils/util'


export const useConnectStore = defineStore('connect-store', {
    state: () => {
        return {
            roomIds: [],
            createRoomLoading: false,
            currentUUID: getCurrentUUID(),
            roomList: [],
            userId: '',
            userName: '',
            roomsData: <any>[],
            peerInfo: {},
            inputFiles: '',
            roomName: '',
        }
    },
    actions: {
        setRoomIds(val: any) {
            if (val.length > 0) {
                const rooms = val.map((e: any) => {
                    return { uuid: e.room_id || e.uuid, title: e.room_name || e.title }
                })
                this.roomIds = uniqueFunc(rooms,'uuid')
                return
            }
            this.roomIds = val
        },
        setCreateRoomLoading(flag: boolean) {
            this.createRoomLoading = flag
        },
        setInputFiles(inputFiles: string) {
            this.inputFiles = inputFiles
        },
        setCurrentUUID(uuid: string) {
            this.currentUUID = uuid
            setCurrentUUID(uuid)
        },
        setPeerInfo(peerInfo: any) {
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
            console.log('initRoomsData====>', rooms)
            if (!rooms) {
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
        getCurrentRoomName() {
            const currentRoom: any = this.roomIds.filter(((item: any) => item.room_id === this.currentUUID || item.uuid === this.currentUUID ))[0]
            if (currentRoom) {
                return currentRoom.title || currentRoom.room_name
            }
            return ''
        },
        getRoomIdByName(name: string) {

        }
    }

})