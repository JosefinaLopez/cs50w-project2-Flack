function renderMessage(data) {
    console.log('test')
    console.log(data)

    const mensajes = data.mensajes;
    let username = localStorage.getItem("username");
    const chatListElement = document.getElementById("chat-list");
    const chatbubble = document.querySelectorAll(".chat-bubble");
    chatListElement.innerHTML = '';
    chatbubble.innerHTML = '';

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

        // Verificar si el mensaje comienza con '/'
        if (mensaje[1].startsWith('/')) { 
            messageElement.innerText="";
            chatBubble.style.maxHeight = '300px';
            const imgElement = document.createElement("img");
            imgElement.src = mensaje[1]; // Establecer la ruta como fuente de la imagen
            chatBubble.appendChild(imgElement);
        }
        chatListElement.appendChild(chatBubble);
    });
}
var isuser;
document.addEventListener('DOMContentLoaded', () => {
    // disable submit
    const chatForm = document.querySelector('#formwrite')

    // Conexión a Websocket
    var socket = io();
    // Canal seleccionado
    //const chatlist = document.getElementById('chat-list');
    var canal = localStorage.getItem("CanalSeleccionado");
    let username = localStorage.getItem("username");
    let Join = document.getElementById("Join");
    socket.emit("Join_Channel", { canalx: canal, username: username });
    // Evento 'join'
    socket.on('Join_Channel', data => {
        fetchChannelInfo(canal);
        const li = document.createElement("li");
        li.textContent = `${data.username} Ha entrado al Canal ${canal}`;
        console.log(`${data.username} Ha entrado al Canal ${canal}`);
        Join.appendChild(li);
        // Almacenar el mensaje en localStorage
        const messages = JSON.parse(localStorage.getItem('channelMessages')) || [];
        messages.push(li.textContent);
        localStorage.setItem('channelMessages', JSON.stringify(messages));
    });


    const ms2 = document.getElementById("join_usernames");
    ms2.innerText = username;
    //console.log(data.username);
    
    // Evento 'connect'
    socket.on('connect', () => {
        console.log('Conectado al servidor');
    });

    // Recuperar mensajes previos desde localStorage
    const storedMessages = JSON.parse(localStorage.getItem('channelMessages')) || [];

    // Agregar los mensajes almacenados a la lista
    storedMessages.forEach(messageText => {
        const li = document.createElement("li");
        li.textContent = messageText;
        Join.appendChild(li);
    });

    // desactivar el reload al darle enter al input
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
    });

    document.getElementById("chatwrite").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("xddd").click();
        }
    });

    //!Enviar mensaje de texto 
    document.getElementById('xddd').addEventListener("click", async () => {
        try {
            const user_ms = document.getElementById("join_usernames").innerText;
            const canal = localStorage.getItem("CanalSeleccionado");
            let mensaje = document.getElementById("chatwrite").value;
            // Enviar el nombre de la imagen como mensaje al servidor
            socket.emit("Mensaje Nuevo", {
                username: user_ms,
                mensaje: mensaje,
                canale: canal,
            });

            // Limpiar el campo de entrada de archivos
            mensaje.value = "";

            // Manejar la respuesta del servidor si es necesario
           // alert("Imagen enviada con éxito.");

        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar la imagen: " + error);
        }
        chatForm.reset();
    });
    //!Enviar Imagen
    document.getElementById('xd').addEventListener("click", async () => {
        try {
            const fileInput = document.getElementById("imageInput");
            const file = fileInput.files[0];

            const user_ms = document.getElementById("join_usernames").innerText;
            const canal = localStorage.getItem("CanalSeleccionado");
            const imgName = '/static/img/chat/'+ file.name; // Obtener el nombre de la imagen

            //!Creo un objeto para enviar la imagen al servidor
            // Creo un objeto FormData para enviar la imagen al servidor
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const imagePath = await response.text();
                // Manejar la respuesta del servidor si es necesario
                alert("Imagen enviada con éxito. Ruta de la imagen: " + imagePath);
            } else {
                throw new Error('Error al enviar la imagen');
            }
            // Limpiar el campo de entrada de archivos
            fileInput.value = "";

            //! Enviar el nombre de la imagen como mensaje al servidor
            socket.emit("Mensaje Nuevo", {
                username: user_ms,
                mensaje: imgName,
                canale: canal,
            });

            // Limpiar el campo de entrada de archivos
            fileInput.value = "";

            // Manejar la respuesta del servidor si es necesario
            alert("Imagen enviada con éxito.");

        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar la imagen: " + error);
        }
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

    function mostrarSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.style.display = 'block';
    }

    fetchChannelInfo(canal);

    // Emitir 'Listar Mensajes'
    socket.emit('Lista de Mensajes', {
        canal: canal
    });
    document.getElementById('salir').addEventListener("click", event => {
        mostrarSidebar();
        let username = localStorage.getItem("username");
        socket.emit("Leave_Channel", { 'canal': canal });
        localStorage.removeItem("CanalSeleccionado")
        window.location.href = "/Channels/" + username;
    });
    
    document.getElementById('xd').addEventListener('click', async function () {
        try {
            // Llama a la función fetchData cuando se hace clic en el botón
            const imagePath = await fetchData();
            
            console.log('Ruta de la imagen obtenida:', imagePath);
            
        } catch (error) {
            console.error('Ocurrió un error:', error.message);
            
        }
    });
    async function fetchData() {
        try {
            const response = await fetch('/upload'); 
            if (response.ok) {
                const data = await response.json();
                return data.imagePath; 
            } else {
                throw new Error('Error al obtener la imagen');
            }
        } catch (error) {
            throw error; // Propaga el error para que pueda ser manejado en el lugar donde se llama fetchData()
        }
    }

    // Escuchar el evento "Listar Mensajes" del servidor
    socket.on("Listar Mensajes", renderMessage);
    socket.on("Lista de Mensajes", renderMessage);

    function ocultarSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.style.display = 'none';

    }
    //ocultarSidebar();
});