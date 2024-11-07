from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import socket

# Configurações do servidor
HOST = "192.168.0.101"  # Altere para o IP correto do seu PC
PORT = 5555  # Porta para comunicação com o Arduino

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")


# Rota para exibir a página HTML
@app.route("/")
def index():
    return render_template("display.html")


# Função para receber dados do Arduino e enviar ao frontend via WebSocket
def iniciar_servidor():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as servidor:
        servidor.bind((HOST, PORT))
        servidor.listen()
        print(f"Esperando conexão no IP {HOST} e porta {PORT}...")

        conexao, endereco = servidor.accept()
        with conexao:
            print(f"Conectado por {endereco}")
            while True:
                dados = conexao.recv(1024)
                mensagem = dados.decode("utf-8").strip()
                if mensagem == "0":
                    socketio.emit(
                        "start",
                        {
                            "start": 1,
                        },
                    )
                else:
                    socketio.emit(
                        "finish",
                        {
                            "finish": mensagem,
                        },
                    )


# Inicia o servidor em uma thread separada
@socketio.on("connect")
def handle_connect():
    print("Cliente conectado.")


if __name__ == "__main__":
    socketio.start_background_task(
        iniciar_servidor
    )  # Inicia a leitura TCP em segundo plano
    socketio.run(app, host="0.0.0.0", port=5000)
