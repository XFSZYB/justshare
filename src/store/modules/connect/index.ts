import { defineStore } from 'pinia'


export const useConnectStore = defineStore('connect-store', {
    state: () => {
        return {
            roomList: {},
            userId: '',
            userName: '',
            roomsData: <any>[],
            peerInfo:{}
        }
    },
    actions: {
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