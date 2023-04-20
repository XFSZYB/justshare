const express = require('express');
const router = express.Router();

/**
 * import all controller
 */

const groupChatRoomController = require("../controllers/groupChatRoomController");
const authenticationController = require('../controllers/authenticationController');


router.post("/register", authenticationController.handleRegister);

router.post("/login", authenticationController.handleLogin);

router.post("/logout", authenticationController.handleLogout);

router.get('/rooms', groupChatRoomController.handleGetRooms);

router.get("/myroomids", authenticationController.handleGetUserRoomIds);

router.get("/finduser", authenticationController.findUser);

router.get("/mycreateroomids", authenticationController.handleMyCreateRoomids);


module.exports = router;
