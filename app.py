from calendar import c
from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS
import socket
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
CORS(app)  # Adiciona suporte ao CORS
socketio = SocketIO(app)

# Configurações do servidor TCP
TCP_IP = '127.0.0.1'
TCP_PORT = 3334
BUFFER_SIZE = 1024

# Variáveis globais
race_data = {
    'checkpoints': [],
    'finish_time': None,
}

# Função para lidar com conexões TCP e receber dados do ESP32
def tcp_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind((TCP_IP, TCP_PORT))
    sock.listen(1)
    print(f"Servidor TCP escutando na porta {TCP_PORT}...")

    conn, addr = sock.accept()
    print(f"Conexão de: {addr}")
    first = False
    checkpoint1 = False
    checkpoint2 = False
    checkpoint3 = False
    chegada = False
    try:
        while True:
            data = conn.recv(BUFFER_SIZE)
            if not data:
                break
            
            message = data.decode().strip()
            if not first:
                socketio.emit('comeco', message)  
                first = True
            elif not checkpoint1:
                socketio.emit('check1', message)  
                checkpoint1 = True
            elif not checkpoint2:
                socketio.emit('check2', message)  
                checkpoint2 = True
            elif not checkpoint3:
                socketio.emit('check3', message)  
                checkpoint3 = True
            else:
                socketio.emit('chegada', message)
                chegada = True

    finally:
        conn.close()

# Rota principal para renderizar a página
@app.route('/')
def index():
    return render_template('display.html')

# Inicia o servidor TCP em uma thread separada
if __name__ == '__main__':
    # Inicia a thread do servidor TCP
    tcp_thread = threading.Thread(target=tcp_server)
    tcp_thread.daemon = True  # Permite que o programa termine mesmo que a thread esteja em execução
    tcp_thread.start()

    # Inicia o servidor Flask
    socketio.run(app, host='127.0.0.1', port=5000)
