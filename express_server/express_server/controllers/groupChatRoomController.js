const signaling = require("../signaling/signaling");
const sendSignalThroughResponse = signaling.sendThroughResponse;
const sqlite3Controller = require('./sqliteController')
const signalTypeEnum = signaling.typeEnum;
const util = require('../util')

let rooms = [];
const userRoomMap = new Map();

exports.handleGetRooms = async (req, res, next) => {
  const tempRooms = await sqlite3Controller.getAllRoom()
  // console.info('tempRooms==>',tempRooms)
  rooms = util.uniqueFunc(tempRooms, 'room_id')
  sendSignalThroughResponse(res, signalTypeEnum.GET_ROOMS, {
    rooms: rooms,
  });
};
exports.rooms = rooms;
exports.userRoomMap = userRoomMap;

