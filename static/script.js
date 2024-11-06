let startTime;
let timerInterval;
let startTimestamp; // Armazena o timestamp de início
let currentTimeMilliseconds = 0; // Armazena o tempo em milissegundos

// Inicia o cronômetro
function startTimer() {
  startTimestamp = Date.now(); // Salva o timestamp de início
  currentTimeMilliseconds = 0; // Reinicia o tempo acumulado
  timerInterval = setInterval(updateTimer, 10); // Atualiza a cada 10 milissegundos
}

// Atualiza o cronômetro
function updateTimer() {
  currentTimeMilliseconds = Date.now() - startTimestamp; // Calcula o tempo total em milissegundos
  const minutes = Math.floor((currentTimeMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((currentTimeMilliseconds % 60000) / 1000);
  const milliseconds = Math.floor(currentTimeMilliseconds % 1000);

  document.getElementById("minutes").innerText = String(minutes).padStart(
    2,
    "0"
  );
  document.getElementById("seconds").innerText = String(seconds).padStart(
    2,
    "0"
  );
  document.getElementById("milliseconds").innerText = String(
    milliseconds
  ).padStart(3, "0");
}

// WebSocket para receber dados em tempo real do servidor Python
const socket = io.connect("http://localhost:5000");

socket.on("comeco", function () {
  console.log("Corrida começou!");
  startTimer();
});

socket.on("check1", function () {
  console.log("Passou pelo checkpoint 1");
  const checkpointTime = formatTime(currentTimeMilliseconds); // Formata o tempo atual em milissegundos
  updateTime("sensor1-time", checkpointTime);
});

socket.on("check2", function () {
  console.log("Passou pelo checkpoint 2");
  const checkpointTime = formatTime(currentTimeMilliseconds); // Formata o tempo atual em milissegundos
  updateTime("sensor2-time", checkpointTime);
});

socket.on("check3", function () {
  console.log("Passou pelo checkpoint 3");
  const checkpointTime = formatTime(currentTimeMilliseconds); // Formata o tempo atual em milissegundos
  updateTime("sensor3-time", checkpointTime);
});

socket.on("chegada", function () {
  console.log("Corrida acabou!");
  const finishTime = formatTime(currentTimeMilliseconds); // Formata o tempo atual em milissegundos
  updateTime("finish-time", finishTime);
  clearInterval(timerInterval); // Para o cronômetro quando chega ao final
});

// Função para formatar o tempo em mm:ss:ms
function formatTime(elapsedTime) {
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  const milliseconds = elapsedTime % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}:${String(milliseconds).padStart(3, "0")}`;
}

// Função para atualizar o tempo de cada sensor
function updateTime(sensor, message) {
  const timeElement = document.getElementById(sensor);
  timeElement.innerText = message; // Atualiza o texto do elemento

  timeElement.classList.add("highlight"); // Adiciona destaque com animação
  playSound(sensor === "finish-time" ? "finish-sound" : "checkpoint-sound");
}

// Função para tocar os sons
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.play();
  }
}
