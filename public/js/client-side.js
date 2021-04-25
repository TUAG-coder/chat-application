const socket = io();

const $chatForm = document.querySelector('#typing-form');
const $chatFormInput = $chatForm.querySelector('input');
const $chatFormButton = $chatForm.querySelector('button');

const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;

const locationTemplate = document.querySelector('#location-message-template').innerHTML;

const autoScrolling = () => {
    const $latestMessage = $messages.lastElementChild; 
    
    const latestMessageStyles = getComputedStyle($latestMessage);       
    const latestMessageMargin = parseInt(latestMessageStyles.marginBottom);
    const latestMessageHeight = $latestMessage.offsetHeight + latestMessageMargin;

    const visibleMessageHeight = $messages.offsetHeight;

    const totalMessageHeight = $messages.scrollHeight;

    const scrollOffset = visibleMessageHeight + $messages.scrollTop;

    if (totalMessageHeight - latestMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (msg, userName) => {
    console.log(msg);
    user = "Admin";
    if (userName) {
        user = userName;
    }
    const html = Mustache.render(messageTemplate, { 
        username: user,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScrolling();
})


socket.on('messageLocation', (link, userName) => {
    console.log(link);
    const html = Mustache.render(locationTemplate, {
        username: userName,
        url: link.url,
        createdAt: moment(link.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScrolling();
});

$chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const msg = evt.target.elements.Message.value;
    $chatFormButton.setAttribute('disabled', '');

    socket.emit('sent', msg, (badLang) => {
        $chatFormButton.removeAttribute('disabled');
        $chatFormInput.value = '';
        $chatFormInput.focus();
        if (badLang) {
            return alert(badLang);
        }
        console.log("Message delivered!");
    });
});

const $locationButton = document.querySelector('#send-location');

$locationButton.addEventListener('click', () => {
    $locationButton.setAttribute('disabled', '');
    if (!navigator.geolocation) {
        return alert("Your browser doesn't support Geolocation");
    }
    navigator.geolocation.getCurrentPosition((position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        socket.emit('sendPosition', {
            Latitude: latitude,
            Longitude: longitude
        }, () => {
            $locationButton.removeAttribute('disabled');
            console.log('Location shared!');
        });

    });
});

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}); 

socket.emit('join', { username, room }, (err) => {
    if (err) {
        alert(err);
        location.href = '/';
    }
});

const $users = document.querySelector('.users_area');
const usersTemplate = document.querySelector('#usersArea_template').innerHTML;

socket.on('usersList', (roomData) => {
    const html = Mustache.render(usersTemplate, {
        roomName: roomData.room,
        users: roomData.allUsers
    });
    $users.innerHTML = html;
});