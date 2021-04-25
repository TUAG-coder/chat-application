const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: "username or room field can't be empty"
        }
    }

    const existingUser = users.find(user => {
        return user.username === username && user.room === room; 
    })
    if (existingUser) {
        return {
            error: 'Username already in use !'
        }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const userIndex = users.findIndex(user => {  
        return user.id === id;
    })
    if (userIndex !== -1) {     
        return users.splice(userIndex, 1)[0];
    }   
}

const getUser = (id) => {
    findUser = users.find(user => {
        return user.id === id;
    })
    return findUser;
}

const getAllUsers = (room) => { 
    const allUsers = users.filter(user => {
        return user.room === room;
    })
    return allUsers;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getAllUsers
}

