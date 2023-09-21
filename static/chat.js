function renderMessage(data) {
    console.log('test')
    console.log(data)
    
    const mensajes = data.mensajes;
    let username = localStorage.getItem("username");
    const chatListElement = document.getElementById("chat-list");
    chatListElement.innerHTML = '';

    mensajes.forEach((mensaje) => {
        const chatBubble = document.createElement("div");
        console.log(mensaje[0]);
        console.log(username);

        chatBubble.classList.add("chat-bubble");
        if (mensaje[0] === username) {
            chatBubble.classList.add("chat-bubble-left");
        } else {
            chatBubble.classList.add("chat-bubble-right");
        }
        const usernameElement = document.createElement("span");
        usernameElement.classList.add("username");
        usernameElement.innerText = `~${mensaje[0]}`;

        const messageElement = document.createElement("p");
        messageElement.classList.add("message");
        messageElement.innerText = mensaje[1];

        const timeElement = document.createElement("span");
        timeElement.classList.add("time");
        timeElement.innerText = mensaje[2];

        chatBubble.appendChild(usernameElement);
        chatBubble.appendChild(messageElement);
        chatBubble.appendChild(timeElement);

        chatListElement.appendChild(chatBubble);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Conexión a Websocket
    var socket = io();
    // Canal seleccionado
    var canal = localStorage.getItem("CanalSeleccionado");
    let username = localStorage.getItem("username");
    let Join = document.getElementById("Join");
    socket.emit("Join_Channel", { canalx: canal, username : username});
    // Evento 'join'
    socket.on('Join_Channel', data => {
        const li = document.createElement("li");
        li.textContent = data.username + " " + "Ha entrado al Canal"+ " " + canal;
        
        fetchChannelInfo(canal);

    });

    const ms2 = document.getElementById("join_usernames");
    ms2.innerText = username;
    //console.log(data.username);
    
    
    // Evento 'connect'
    socket.on('connect', () => {
        console.log('Conectado al servidor');
    });

    function fetchChannelInfo(canal) {
        fetch('/Channels/Info/' + canal, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                const canal_select = document.getElementById("canal");
                canal_select.innerText = data.canal.canal_name;

                const parti = document.getElementById("integrantes");
                parti.innerText = "Integrantes: " + data.participantes;

                const user = document.getElementById("join_usernames");
                user.innerText = data.username;
            })
            .catch(error => {
                console.log("error: " + error);
            });
    }

    fetchChannelInfo(canal);

    // Emitir 'Listar Mensajes'
    socket.emit('Lista de Mensajes', {
        canal: canal
    });
    document.getElementById('salir').addEventListener("click",event =>{
        let username = localStorage.getItem("username");
        socket.emit("Leave_Channel",{'canal': canal});
        localStorage.removeItem("CanalSeleccionado")
        mostrarSidebar();
        window.location.href = "/Channels/" + username; 
    });

    function mostrarSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = ''; // Restaura el valor original del estilo (por ejemplo, 'block' o 'inline')
        }
    }
    // Evento click en 'xd'
    document.getElementById('xd').addEventListener("click", event => {
        event.preventDefault();
        const user_ms = document.getElementById("join_usernames").innerText;
        const msj = document.getElementById("chatwrite").value;
        var canal = localStorage.getItem("CanalSeleccionado");
        console.log(user_ms);
        try{
            socket.emit("Mensaje Nuevo", {
                username: user_ms,
                mensaje: msj,
                canale: canal
            });
        }catch(error){
            alert("ERROR: " + error);   
        }
        const msjElement = document.getElementById("chatwrite"); // Obtiene el elemento de entrada
        msjElement.value = ""

    });

    // Escuchar el evento "Listar Mensajes" del servidor
    socket.on("Listar Mensajes", renderMessage);
    socket.on("Lista de Mensajes", renderMessage);

    function ocultarSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.style.display = 'none';

    }
    ocultarSidebar();
});