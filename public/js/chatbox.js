// Connect to the Socket.IO server
const socket = io('http://localhost:8000');

// Get the chat messages container element
const chatMessages = document.getElementById('chatMessages');

// Get the message input field
const messageInput = document.getElementById('messageInput');

// Get the messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// Display the messages from local storage
// messages.forEach((message) => {
//     const messageElement = document.createElement('div');
//     messageElement.textContent = message;
//     chatMessages.appendChild(messageElement);
// });


messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        sendMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
        // Add a newline character to the textarea
        messageInput.value += '\n';
    }
});

function sendMessage() {
    // Get the message input value
    const message = messageInput.value.replace(/\n/g, '<br>');
    console.log(message);

    // Emit the 'message' event with the message and the flag
    socket.emit('message', message, true);

    // Add the message to the local storage
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    // Clear the input field
    messageInput.value = '';
}

// Listen for new chat messages from the server
socket.on('chat_message', (msg, isSentByCurrentUser) => {
    console.log('Received message:', msg);
    const messageElement = document.createElement('div');
    messageElement.innerHTML = msg; // Use innerHTML to render the message as HTML

    // Add a class based on the sender
    if (isSentByCurrentUser) {
        messageElement.classList.add('message-right');
    } else {
        messageElement.classList.add('message-left');
    }

    messageElement.style.backgroundColor = '#f1f1f1';
    messageElement.style.padding = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.marginBottom = '10px';

    chatMessages.appendChild(messageElement);

    // Add the message to the local storage
    messages.push(msg);
    localStorage.setItem('messages', JSON.stringify(messages));
});

