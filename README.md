# Project 2

## Para ejecutar 
> Python "application.py"

## Inicio 
Se pide el nombre del usuario, que le permitira interactuar con los demas integrantes.
![Alt text](static/img/readme/img1.png)

## Creaccion de Canal
El usuario podra crear canales para interactuar con otros usuarios.
![Alt text](static/img/readme/im2.png)
## Lista de Canales 
En la parte izquierda se mostrara la lista de canales creados por usuarios, en donde cada uno,
lo llevara a una sala de chat, tambien podra buscar directamente e ir a la sala de chat ingresando el 
nombre del canal en la barra de busqueda.
![Alt text](static/img/readme/img3.png)
## Mensajes
En la sala de chat , esta limitada para recibir solamente 100 mensajes, luego no le dejara enviar mas
tambien se implemento la funcionalidad de envio de imagenes.
![Alt text](static/img/readme/img4.png)

## Datos
A como se sabe para el resguardo de mensajes se uso el localstorage y un diccionario 
en la parte del servidor, por lo cual son datos que se borraran cada que se reinicie el servidor
al implementar la funcionalidad de imagenes, no sera necesario manterlas luego que ya no existan 
registros de mensajes en el servidor, por lo cual, se creo un metodo para que cada que se reinicie o
ejecute , se eliminen tambien las mensajes anteriores de la carpeta especificada.
![Alt text](static/img/readme/img5.png)

Web Programming with Python and JavaScript
