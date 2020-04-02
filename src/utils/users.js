const users =[]

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room})=>{
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validation
    if (!username || !room) {
        return {
            error:'Username and room name are required'
        }
    }

    // check of existing user
    const existingUser = users.find((user)=>{
        
        return user.room === room && user.username ===username
    })

    // validate username
    console.log(existingUser)
    if (existingUser) {
        return {
            error:'Username is in use'
        }
    }

    const user = {id, username, room}

    users.push(user)

    return { user}
}

const removeUser = (id) =>{

    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0] // users.splice return removed users array
    }
}

const getUser = (id) =>{

    const user = users.find((user)=>{
       return user.id === id
    })

    if (user) {
        
        return user
    }
    else
    {
        return undefined
    }
}

const getUsersInRoom = (room)=>{

    // room = room.toLowerCase()
    // const roomUsers=[]

    // users.find((user)=>{
    //     if ( user.room === room) {
    //         roomUsers.push(user)
    //     }
    // })

    // return roomUsers

    return users.filter((user)=>{
        return user.room.toLowerCase() === room.toLowerCase()
    })
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id:21,username:'Sumit',room:"acharya"
// })
// addUser({
//     id:23,username:'ASumit ',room:"acharya"
// })
// addUser({
//     id:26,username:'BSumit ',room:"Vyas"
// })

// const user = getUsersInRoom('vyass')

// console.log(user)

