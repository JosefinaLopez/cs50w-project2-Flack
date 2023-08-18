document.addEventListener('DOMContentLoaded', function () {

    //?Logica de confirmacion de reinicio de servidor 
 //!Aun nofunciona
    fetch('/Info/Session')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if ('error' in data) {
                // Capturar el error y manejarlo aquí
                console.error('Error:', data.error);
            } else {
                // No hay error, trabajar con los datos de sesión
                console.log('Session:', data.session);
                if (Object.keys(data.session).length === 0) {
                    // Si no hay nada en el diccionario del servidor, se borran los datos del navegador
                    localStorage.clear();
                }

            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    //!Logica de reedireccionamiento de pagina, al inicio
    //!nt: cualquier problema , se lo dejo a mi yo del futuro :'v
    let user_confirm = localStorage.getItem("username");
    // Obtener la lista de usuarios del localStorage
    url = localStorage.getItem("CanalSeleccionado");
    let band = false;

    if (!band)
    {
        if(user_confirm != null)
        {  
            if (url == null)
            {
                window.location.href = "/Channels/"+ confirm;
                band = true;
            }
            else{
                window.location.href = "/Channels/Chat/" + url;
                band = true;
            }
        }
    }
    else{
        window.location.href = "/";
        //localStorage.clear();
    }

    document.querySelector("#form").onsubmit = function (event) {
        event.preventDefault();

        
        let confirm = localStorage.getItem("username");
        let username = document.querySelector("#username").value;
        //Si el usuario no existe , se registra su nombre y id generado
        if (username != confirm) {
            localStorage.setItem("username", username);

            //se enviaran los datos del usuario al servidor, para almacenarlos en un diccionario
            fetch('/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({'username': username })
            }).then(response => response.json())
                .then(data => {
                    alert(data.message);
                })
                .catch(error => {
                    console.error('ERROR EN LA SOLICITUD AJAX', error);
                });    

            alert("Welcome " + " "+ username);
            window.location.href = "/Channels/"+ username;
        } else {
            alert("Welcome back!");
            url = localStorage.getItem("CanalSeleccionado");
            window.location.href = "/Channels/Chat/" + url;
        }

        console.log("Llegué hasta aquí");
    }


});
