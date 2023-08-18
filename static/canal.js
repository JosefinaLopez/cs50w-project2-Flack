
document.addEventListener('DOMContentLoaded', () => {

    // Conexion con websocket
    const socket = io();
    

    socket.on('connect', () => {
        console.log('Conectado al servidor');
        socket.emit('Lista de Canales');
    });

    document.getElementById("searc").addEventListener("click", event => {
        event.preventDefault();
        socket.emit('Lista de Canales');
        const search = document.getElementById("search").value.trim();
        console.log(search);
        const xd = document.getElementById("searc");

        socket.on('Lista Canal', data => {
            canales = data.canales;

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
            }
        });
    });


    // Agregar un nuevo canal cuando se envía el formulario
    document.getElementById('addcanals').addEventListener("click", event => {
        const NewCanal = document.getElementById('canalname').value.trim();
        event.preventDefault();

        let existentes = [];
        socket.on('Lista Canal', data => {
            canales = data.canales;
            canales.forEach(canal => {
                existentes.push(canal);
            });
            console.log(existentes);
            localStorage.setItem("canales_guardados", JSON.stringify(existentes))
        });

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


//Recolecta la info del servidor
            socket.on('Lista Canal', data => {
                const canals = data.canales;
                const canallist = document.getElementById("canalnamelist");
                canallist.innerHTML = "";
                console.log(data)
                //print(canals)
                canals.forEach(canal => {
                    const li = document.createElement("li");
                    canal_selectt = canal;
                    li.classList.add("option");
                    li.textContent = canal;


                    li.addEventListener("click", (event) => {
                        localStorage.setItem("CanalSeleccionado", canal);
                        // Realizar alguna acción al hacer clic en el canal 
                        event.preventDefault();

                            console.log("Canal seleccionado: " + canal);
                            window.location.href = '/Channels/Chat/' + canal;

                    });
                    canallist.appendChild(li);
                });
            });
});

