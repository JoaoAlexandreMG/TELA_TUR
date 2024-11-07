// Conecta ao servidor WebSocket
const socket = io.connect("http://192.168.0.101:5000");

let startTime;
let timerInterval;

// Função para atualizar o cronômetro
function atualizarCronometro() {
  const tempoAtual = new Date() - startTime;
  const minutos = String(Math.floor((tempoAtual / 60000) % 60)).padStart(
    2,
    "0"
  );
  const segundos = String(Math.floor((tempoAtual / 1000) % 60)).padStart(
    2,
    "0"
  );
  const milissegundos = String(tempoAtual % 1000).padStart(3, "0");

  document.getElementById("minutes").textContent = minutos;
  document.getElementById("seconds").textContent = segundos;
  document.getElementById("milliseconds").textContent = milissegundos;
}

// Função para iniciar a sequência de largada (sem iniciar o cronômetro)
function iniciarLargada() {
  const luzes = [
    document.getElementById("light1"),
    document.getElementById("light2"),
    document.getElementById("light3"),
  ];
  let index = 0;

  const interval = setInterval(() => {
    document.getElementById("start-sound").play(); // Som de largada
    if (index > 0) luzes[index - 1].classList.remove("active");
    if (index < luzes.length) {
      luzes[index].classList.add("active");
      index++;
    } else {
      clearInterval(interval);
      luzes[luzes.length - 1].classList.remove("active");
      luzes[luzes.length - 1].classList.add("go"); // Luz verde para partida
      luzes[luzes.length - 2].classList.add("go"); // Luz verde para partida
      luzes[luzes.length - 3].classList.add("go"); // Luz verde para partida
      document.getElementById("start-sound").play(); // Som de largada
      setTimeout(() => luzes[luzes.length - 1].classList.remove("go"), 1500); // Remove a luz verde
      setTimeout(() => luzes[luzes.length - 2].classList.remove("go"), 1500); // Remove a luz verde
      setTimeout(() => luzes[luzes.length - 3].classList.remove("go"), 1500); // Remove a luz verde
    }
  }, 1000); // Intervalo entre as luzes
}

// Função para iniciar o cronômetro
function iniciarCronometro() {
  startTime = new Date();
  timerInterval = setInterval(atualizarCronometro, 10);
  document.getElementById("finish-time").textContent = "--:--:--";
}

// Evento para o botão de largada (apenas animação das luzes)
document
  .getElementById("start-button")
  .addEventListener("click", iniciarLargada);

// Evento "start" para iniciar o cronômetro
socket.on("start", () => {
  startTime = new Date();
  timerInterval = setInterval(atualizarCronometro, 10); // Atualiza a cada 10ms
  document.getElementById("finish-time").textContent = "--:--:--"; // Limpa o tempo de chegada
});

// Evento "finish" para parar o cronômetro e exibir o tempo final formatado
socket.on("finish", () => {
  document.getElementById("finish-sound").play(); // Som de chegada
  clearInterval(timerInterval); // Para o cronômetro

  // Calcula e formata o tempo final apenas uma vez
  const tempoFinal = new Date() - startTime;
  const minutos = String(Math.floor((tempoFinal / 60000) % 60)).padStart(
    2,
    "0"
  );
  const segundos = String(Math.floor((tempoFinal / 1000) % 60)).padStart(
    2,
    "0"
  );
  const milissegundos = String(tempoFinal % 1000).padStart(3, "0");

  // Define o tempo final para ambas as exibições
  const tempoFormatado = `${minutos}:${segundos}.${milissegundos}`;
  document.getElementById("minutes").textContent = minutos;
  document.getElementById("seconds").textContent = segundos;
  document.getElementById("milliseconds").textContent = milissegundos;
  document.getElementById("finish-time").textContent = tempoFormatado;
});
