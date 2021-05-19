let activeRooms = []

module.exports = {
    registerAndGetRoom: roomId => {
        let room = activeRooms.find(r => r.roomId == roomId)
        if (room == undefined) {
            activeRooms.push({ roomId: roomId, users: [] })
            room = activeRooms.find(r => r.roomId == roomId)
        }
        return room
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket Not Initialized')
        }
        return io;
    }
};
