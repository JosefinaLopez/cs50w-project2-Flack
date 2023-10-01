import os
from datetime import datetime
import uuid
from flask import Flask, request, render_template, jsonify,session
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.utils import secure_filename  #! esto xd garantizara un nombre de archivo seguro


app = Flask(__name__)
app.debug = True
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app,apcors_allowed_origins="*")

#?Configurar Session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
UPLOAD_FOLDER = 'static/img/chat'  # Carpeta 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}  # Extensiones permitidas
Session(app)


data = {
    'user_session': {}, 
    'headers':{
        'user_count': 0,
        'channel_count': 0
    },
    'users':{},
    'channels':{}
}

@app.route("/", methods=["GET","POST"])
def index():
    if request.method == "POST":
        data_json = request.get_json()
        user = data_json.get('username')
        user_id = generator_id(user)
        print(user_id)
        #user_id = data_json.get('id')
        session['user_id'] = user_id
        session['user_name'] = user
        
        data['user_session'][user] = {
            'user_id': user_id
        }
        print(data["user_session"])
        print(user_id)
    return render_template("index.html")

# Función para verificar si la extensión del archivo es válida
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST', 'GET'])
def upload_file():
    if 'image' not in request.files:
        return "No se seleccionó ningún archivo de imagen."
    
    file = request.files['image']
    
    if file.filename == '':
        return "No se seleccionó ningún archivo de imagen."
    
    if file and allowed_file(file.filename):
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        
        filename = secure_filename(file.filename)
        
        # Guarda el archivo en la carpeta de destino
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return '/'+ UPLOAD_FOLDER +'/' +filename
    else:
        return "Formato de archivo no válido. Se permiten solo archivos PNG, JPG o JPEG."

@socketio.on('connect')
def handle_connect():
    print('Un cliente se ha conectado')
    

@socketio.on('disconnect')
def handle_disconnect():
    session.clear()
    print('Un cliente se ha desconectado')


@app.route("/Channels/<string:username>")
def chan(username):
    return render_template("layout.html")

def generator_id(username):
    id_u = uuid.uuid4()
    user_id = f"{username}_{id_u}"
    return user_id
    
@app.route("/Info/Session", methods=["GET", "POST"])
def get_inf_session():
    if data['user_session'] is None:
        return jsonify({'error': 'User session is empty'}), 400
    return jsonify({'session': data['user_session']})
    
@app.route("/Channels/Info/<string:namecanal>", methods=["GET","POST"])
def get_inf_canal(namecanal):
        if namecanal in data['channels'].keys():
            canal = data['channels'].get(namecanal)
            canal_select = namecanal
            cant_part = data['channels'][namecanal]['parti']
            mensajes = list(data['channels'][namecanal]['messages'])
            #Obtener el nombre de usuario de la sesión actual
            username = session['user_name']
            print(username) 
            print(canal)
            print(mensajes)
            
            if canal:
                mensajes = canal['messages']
                #return render_template("chats.html", username = username, inf = canal_select, mensajes = mensajes, cant = cant_part)
                return jsonify({'canal': canal, 'participantes': cant_part, 'mensajes': mensajes, 'username': username})
            else:
                return jsonify({'error': 'Canal no encontrado'})

    
@app.route("/Channels/Chat/<string:namecanal>", methods=["GET", "POST"])
def chat(namecanal):
    return render_template("chats.html")

@socketio.on("Nuevo Canal")
def addcanal(datas):
    canal = datas["canal"]
    #user_id = session.get('user_id')
    if canal != data['channels'].keys():
        channel_dict = {
            'canal_name': canal,
            'id_channel': data['headers']['channel_count'] + 1,
            'parti_user_id': [],
            'messages': [],
            'parti': 0
        }
        #data['headers']['channel_count'] +=1
        data['channels'][canal] = channel_dict
        print(data['channels'])
        emit("Nuevo Canal", {"canal": canal}, broadcast=True)
    else:
        jsonify("Nombre de Canal Existente")
    #emit("Lista de Canales", {"canales": canales}, broadcast=True)

@socketio.on("Lista de Canales")
def handle_list_channel():
    print('probando')
    canales = list(data['channels'].keys())  # Obtener una lista con los nombres de los canales
    emit("Lista Canal", {"canales": canales}, broadcast=True)

@socketio.on("Join_Channel")
def handle_join(datas):
    canal = datas["canalx"]
    username = datas["username"]
    user_id = session.get('user_id')

    channel_data = data['channels'][canal]
    parti_user_id = channel_data['parti_user_id']

    if user_id not in parti_user_id:
        parti_user_id.append(user_id)
        channel_data['parti'] += 1
        join_room(canal)
        channels_user = data['channels']
        print("Un usuario ha entrado a la sala de chat")
        emit("Join_Channel", {
            "username": username,
            "channel": canal
        }, broadcast=True)
    else:
        join_room(canal)
        channels_user = data['channels']
        print("Un usuario ha entrado a la sala de chat")
        emit("Join_Channel", {
            "username": username,
            "channel": canal
        }, broadcast=True)



        
@socketio.on("Leave_Channel")
def handle_join(data):
    canal = data['canal']
    leave_room(canal)        

@socketio.on("Mensaje Nuevo")
def add(datas):
    canal = datas['canale']
    print(canal)
    username =  datas['username']
    message = datas["mensaje"]
    current_time = datetime.now().strftime("%H:%M:%S")
    mensaje = (username, message,current_time)  # Crear una tupla con username y message
    print(mensaje)
    if len(data['channels'][canal]['messages']) < 100:
        data['channels'][canal]['messages'].append(mensaje)  # Agregar la tupla a la lista
        ms = data['channels'][canal]['messages']
        emit("Nuevo Mensaje", {
            "username": username,
            "mensaje": message,
            "hora_envio": current_time
        }, broadcast=True)
        emit("Listar Mensajes",{"mensajes":ms}, broadcast=True)
    else: 
        jsonify({'error':"cantidad de mensajes excedida por canal"})
    
@socketio.on("Lista de Mensajes")
def handle_list_channel(datas):
    mensajes = list(data['channels'][datas["canal"]]["messages"])  # Obtener una lista con los nombres de los canales
    emit("Lista de Mensajes", {"mensajes": mensajes}, broadcast=True)

def DeleteImg():
    ruta = './static/img/chat'
    photos = os.listdir(ruta)
    for photo in photos:
        path = os.path.join(ruta,photo)
        os.remove(path)

if __name__ == '__main__':
    DeleteImg()    
    socketio.run(app)