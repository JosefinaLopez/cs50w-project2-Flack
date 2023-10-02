
document.addEventListener('DOMContentLoaded', () => {

    // Conexion con websocket
    const socket = io();


    socket.on('connect', () => {
        console.log('Conectado al servidor');
        socket.emit('Lista de Canales');
    });

    document.getElementById("owo").addEventListener("click", event => {
        event.preventDefault();
        const search = document.getElementById("search").value.trim();
        localStorage.setItem("CanalSeleccionado", search);

        alert(search);
        const xd = document.getElementById("searc");

        // Mover la emisión del evento al controlador de eventos 'Lista Canal'
        socket.on('Lista Canal', data => {
            const canales = data.canales;

            let canalEncontrado = false;

            canales.forEach(canalx => {
                if (canalx === search) {
                    console.log(canalx);
                    console.log("Canal Encontrado");
                    canalEncontrado = true;
                }
            });

            if (canalEncontrado) {
                xd.href = "/Channels/Chat/" + search;
                // Cambiar la URL directamente solo si el canal se encuentra
                window.location.href = xd.href;
                socket.emit('Join_Channel', { 'canal': search });
            }
        });

        // Emitir el evento 'Lista de Canales' después de configurar el controlador de eventos
        socket.emit('Lista de Canales');
    });

    function ocultarSidebar() {
        sidebar = document.querySelector(".sidebar");
        sidebar.style.display = 'none';
    }
    function mostrarSidebar() {
        sidebar = document.querySelector(".sidebar");
        sidebar.style.display = 'block';
    }

    var existentes = []
    socket.on('Lista Canal', data => {
        const canals = data.canales;
        const canallist = document.getElementById("canalnamelist");
        canallist.innerHTML = "";

        canals.forEach(canal => {
            const li = document.createElement("li");
            canal_selectt = canal;
            li.classList.add("option");

            // Crear el elemento de icono
            const icono = document.createElement("i");
            icono.classList.add("bi", "bi-wechat"); 
            icono.style.fontSize = "1.5rem";
            li.appendChild(icono); // Añadir el icono al elemento <li>

            // Crea el elemento de texto para el nombre del canal
            const textoCanal = document.createTextNode("   " + canal); 
            li.appendChild(textoCanal); 

            existentes.push(canal);

            li.addEventListener("click", (event) => {
                let canalex = localStorage.setItem("CanalSeleccionado", canal);
                // Realizar alguna acción al hacer clic en el canal 
                event.preventDefault();
                console.log("Canal seleccionado: " + canal);
                window.location.href = '/Channels/Chat/' + canal;
            });

            canallist.appendChild(li);
            let canalex = localStorage.getItem("CanalSeleccionado", canal);

            if (canalex) {
                ocultarSidebar();
            } else {
                mostrarSidebar();
            }
        });
    });


    // Agregar un nuevo canal cuando se envía el formulario
    document.getElementById('addcanals').addEventListener("click", event => {
        const NewCanal = document.getElementById('canalname').value.trim();
        event.preventDefault();

        if (existentes.includes(NewCanal)) {
            alert("El Canal que usted desea crear ya existe, elija otro nombre, por favor");
        } else {
            socket.emit('Nuevo Canal', { canal: NewCanal });
            document.getElementById('canalname').value = "";
            alert("Canal Creado Exitosamente: " + NewCanal);
            socket.emit('Lista de Canales');
            console.log(existentes)
        }
    });

});

function Salir() {
    localStorage.clear()
    window.location.href = "/";
}

