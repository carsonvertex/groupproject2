// Connect to the Socket.IO server
const socket = io('http://localhost:8000');

// Get the chat messages container element
const chatMessages = document.getElementById('chatMessages');

// Get the message input field
const messageInput = document.getElementById('messageInput');

// Get the messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// Display the messages from local storage
messages.forEach((message) => {
    const messageElement = document.createElement('li');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
});

function sendMessage() {
    // Get the message input value
    const message = messageInput.value;
    console.log(message);

    // Emit the 'message' event with the message
    socket.emit('message', message);
    
    // // Add the message to the local storage
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    // Clear the input field
    messageInput.value = '';
}

// Listen for new chat messages from the server
socket.on('chat_message', (msg) => {
    console.log('Received message:', msg);
    const messageElement = document.createElement('li');
    messageElement.textContent = msg;
    chatMessages.appendChild(messageElement);

    // Add the message to the local storage
    messages.push(msg);
    localStorage.setItem('messages', JSON.stringify(messages));
});

sendMessage()