const socket= io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')

const $sendLocationButton =document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) //location.search id for query string

const autoScroll = ()=>{

    // get the new element
    $newMessage = $messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of message container  
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log('containerHeight= '+containerHeight)
    console.log('newMessageHeight= '+newMessageHeight)
    console.log('scrollOffset= '+scrollOffset)

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }

}
// socket.on('countUpdated',(count)=>{
//     console.log('count has been updated ',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('counter incremented...')
//     socket.emit('increment')
// })

socket.on('serverToClient',(serverToClient)=>{
    console.log(serverToClient)
    const html = Mustache.render(messageTemplate,{
        username:serverToClient.username,
        message:serverToClient.text,
        createdAt:moment(serverToClient.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage',(message)=>{

    console.log(message)

    const html = Mustache.render(locationTemplate,{
        username:message.username,
        location:message.url,
        createdAt:moment(locationTemplate.createdAt).format('h:mm a')
    } )

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room, users})=>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value

    socket.emit('clientToServer',message, (error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error)
        {
            return alert(error)
        }

        console.log('Message is delivered to server')
        
    })
})

$sendLocationButton.addEventListener('click',()=>{
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported on ur browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)

        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude:position.coords.longitude
        },(message)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
    

})

socket.emit('join',{username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }
})