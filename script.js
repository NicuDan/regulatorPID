//Steps
//Enter router and connect to internet(User and password)
//Get the Public IP and paste it below
//It should work
//When it works change the IP from PP.../PP... Russia to Static IP and paste the Ip given below
//The rest of the spaces should already completed
//Evenimentul Studenti in fata companiilor ma pot conecta cu routerul la internet(cablu)

//Create a new web socket
const socket = new WebSocket('ws://192.168.1.252/ws');

//Variables
let newArray = [];
let ArrayOfData = [];
var myChart;
let addTime = 0;
let addTime1 = 0;
let a = 0;
let b = 0;
let sample;
let P = document.getElementById('P');
let I = document.getElementById('I');
let D = document.getElementById('D');
let speed = document.getElementById('Speed');
let button = document.getElementById('sendToArduino');
let switchChart = document.getElementById('switchChart');
let result = [];
let sendSpeed;
let myChart2;

//
const favicon =
  document.querySelector('link[rel="icon"]') || document.createElement('link');

// set the href attribute to the new icon URL
favicon.href = 'Materials/logo.png';

// add the favicon element to the document head
document.head.appendChild(favicon);

// console.log(P.value);

//-------------------------------------Manipulate data from input to object-------------------------------------//
//Initial
button.disabled = false;
button.style.backgroundColor = '#3498db';
// PID.style.border = '2px solid #ddd';
// //
// PID.addEventListener('keyup', () => {});
button.addEventListener('click', (event) => {
  //Assign values to send
  P = document.getElementById('P');
  I = document.getElementById('I');
  D = document.getElementById('D');
  event.preventDefault();
  //
  //-------------------------------------Sending data-------------------------------------//
  let Time = document.getElementById('Time');
  let Samples = document.getElementById('Samples');
  sendSpeed = map_range(checkSpeed, 0, 2150, 0, 255);
  console.log(sendSpeed);
  //Create an object for data to be send
  let dataObject = {
    P: P.value,
    I: I.value,
    D: D.value,
    Speed: sendSpeed,
    Time: Time.value,
    Samples: Samples.value,
  };
  //Transform data to json
  let json = JSON.stringify(dataObject);

  //Debuging
  console.log(json);

  //Save some data

  //Send data to arduino
  socket.send(json);
});

function checkPattern(input) {
  let regexArray =
    /\[\d+\s\d+\s\d+\]|\[\d+\.\d+\s\d+\s\d+\]|\[\d+\s\d+\.\d+\s\d+\]|\[\d+\s\d+\s\d+\.\d+\]|\[\d+\.\d+\s\d+\.\d+\s\d+\]|\[\d+\.\d+\s\d+\s\d+\.\d+\]|\[\d+\s\d+\.\d+\s\d+\.\d+\]|\[\d+\.\d+\s\d+\.\d+\s\d+\.\d+\]/i;
  if (regexArray.test(input)) {
    return true;
  } else {
    return false;
  }
}
//-------------------------------------Receiving data-------------------------------------//

//When the site receive a message from arduino
socket.onmessage = function (event) {
  //Create a div every time the site receive a data(or one div per data) and append it in the console container
  let div = document.createElement('div');
  div.innerHTML = event.data;
  document.getElementById('receivedData').appendChild(div);
  //Add to array
  ArrayOfData = ArrayOfData.concat(JSON.parse(event.data).data);
  sample = JSON.parse(event.data).Sample;
  ArrayOfData.forEach((element, index, array) => {
    array[index] = map_range(element, 0, 255, 0, 2150);
  });

  ArrayOfData.map((element) => {
    if (element > 0 && element < 2150) {
      newArray.push(speed.value - element);
    }
  });
  // console.log(newArray);
  //For chart
  for (a; a < ArrayOfData.length; a++, addTime = addTime + sample) {
    addData(myChart, ArrayOfData[a], addTime.toFixed(2));
  }
  for (b; b < ArrayOfData.length; b++, addTime1 = addTime1 + sample) {
    addData(myChart2, newArray[b], addTime1.toFixed(2));
  }
};
// let checkTime;
// const rotateElement = document.getElementById('#rotate');
// socket.addEventListener('message', function () {
//   while (checkTime != Time) {
//     rotateElement.classList.add = 'fa-spin';
//   }
//   checkTime = checkTime + sample;
// });

// if (checkTime == Time) {
//   checkTime = 0;
//   rotateElement.classList.remove = 'fa-spin';
// }
// while (true) {
//
// }
//-------------------------------------Status connection to arduino-------------------------------------//

let status_arduino = document.querySelector('.status-area');

function checkWebSocketConnection(socket) {
  return new Promise((resolve, reject) => {
    // Check if the WebSocket is already open
    if (socket.readyState === WebSocket.OPEN) {
      resolve(socket);
    } else {
      // If not open, set up an event listener to resolve the promise when it's open
      socket.addEventListener('open', () => {
        resolve(socket);
      });

      // Set up an event listener to reject the promise if an error occurs
      socket.addEventListener('error', (event) => {
        reject(new Error(`WebSocket error: ${event.message}`));
        status_arduino.style.backgroundColor = '#FF5733';
        console.log('Arduino is not connected.');
      });
    }
  });
}
checkWebSocketConnection(socket)
  .then((connectedSocket) => {
    console.log('WebSocket is connected.');
    if (connectedSocket.readyState) {
      status_arduino.style.backgroundColor = '#4CAF50';
      console.log('Arduino is open and connected.');
    } else {
    }
  })
  .catch((error) => {
    console.error(error);
  });

//-------------------------------------Chart.js-------------------------------------//
function addData(chart, newData, label) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(newData);
  });
  chart.update();
}

var canvas = document.getElementById('myChart');
var container = document.getElementsByClassName('chartContainer');
var ctx = canvas.getContext('2d');
myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Stability',
        data: ArrayOfData,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
        cubicInterpolationMode: 'monotone',
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 1)', // Grid color
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)', // Tick color
        },
      },
      x: {
        min: 0, // Set the minimum value on the y-axis
        max: 2000, // Set the maximum value on the y-axis
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 1)', // Grid color
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)', // Tick color
        },
      },
    },
  },
});
//
var canvas2 = document.getElementById('myChart2');
var ctx2 = canvas2.getContext('2d');

myChart2 = new Chart(ctx2, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Error',
        data: ArrayOfData,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
        cubicInterpolationMode: 'monotone',
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 1)', // Grid color
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)', // Tick color
        },
      },
      x: {
        min: 0, // Set the minimum value on the y-axis
        max: 2000, // Set the maximum value on the y-axis
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 1)', // Grid color
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)', // Tick color
        },
      },
    },
  },
});
//-------------------------------------Swap console and Chart-------------------------------------//
// canvas;
// Console = document.getElementById('console');
// let Toggle = true;

// switchChart.addEventListener('click', () => {
//   Toggle = !Toggle;
//   if (Toggle == true) {
//     switchChart.textContent = 'Chart';
//     canvas.style.display = 'flex';
//     Console.style.display = 'none';
//   } else {
//     switchChart.textContent = 'Console';
//     canvas.style.display = 'none';
//     Console.style.display = 'flex';
//   }
// });
//-------------------------------------Copy array to clipboard-------------------------------------//
// buttonCopy = document.querySelector('.copy');
// alertCopy = document.querySelector('.succes-copy');
// buttonCopy.addEventListener('click', () => {
//   navigator.clipboard.writeText(ArrayOfData);
//   alertCopy.style.display = 'flex';
//   setTimeout(() => {
//     alertCopy.style.opacity = '1';
//     setTimeout(() => {
//       alertCopy.style.opacity = '0';
//       setTimeout(() => {
//         alertCopy.style.display = 'none';
//       }, 1000);
//     }, 1000);
//   }, 0);
// });
//-------------------------------------Range control-------------------------------------//
let rangeSpeed = document.querySelector('#rangeSpeed');
let checkSpeed = 1075;
rangeSpeed.style.border = 'solid 1px white';
rangeSpeed.style.backgroundColor =
  'linear-gradient(to right, #3498db 0%, #3498db 50%, #363636 50%, #363636 100%)';
rangeSpeed.addEventListener('input', (event) => {
  speed.value = event.target.value;
  checkSpeed = speed.value;
  event.target.max = 2150;
  event.target.min = 0;
  let value = map_range(event.target.value, 0, 2150, 0, 100);
  event.target.style.background = `linear-gradient(to right, #3498db 0%, #3498db ${value}%, #363636 ${value}%, #363636 100%)`;
  if (checkSpeed <= 2150 && checkSpeed >= 500 && checkSpeed != '') {
    button.disabled = false;
    button.style.backgroundColor = '#3498db';
    button.style.cursor = 'pointer';
  } else {
    button.disabled = true;
    button.style.backgroundColor = '#bbb';
    button.style.cursor = 'not-allowed';
  }
});
speed.addEventListener('input', (event) => {
  rangeSpeed.value = event.target.value;
  checkSpeed = speed.value;
  let value = map_range(event.target.value, 0, 2150, 0, 100);

  rangeSpeed.style.background = `linear-gradient(to right, #3498db 0%, #3498db ${value}%, #363636 ${value}%, #363636 100%)`;
  if (checkSpeed <= 2150 && checkSpeed >= 500 && checkSpeed != '') {
    button.disabled = false;
    button.style.backgroundColor = '#3498db';
    button.style.cursor = 'pointer';
  } else {
    button.disabled = true;
    button.style.backgroundColor = '#bbb';
    button.style.cursor = 'not-allowed';
  }
});
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
////
let resultsButton = document.querySelector('.ResultsButton');
let editButton = document.querySelector('.EditPID');
let consoleButton = document.querySelector('.ConsoleButton');
let aboutButton = document.querySelector('.AboutButton');
let errorButton = document.querySelector('.Error');
let window1 = document.querySelector('.mainWindow');
let window2 = document.querySelector('.mainWindow1');
let window3 = document.querySelector('.mainWindow2');
let window4 = document.querySelector('.mainWindow3');
let window5 = document.querySelector('.mainWindow4');
//Default
editButton.style.backgroundColor = '#2e3273';
//
editButton.addEventListener('click', () => {
  window5.style.display = '';
  window5.style.gridArea = 'none';
  window4.style.gridArea = '';
  window4.style.display = 'none';
  window3.style.gridArea = '';
  window3.style.display = 'none';
  window2.style.gridArea = '';
  window2.style.display = 'none';
  window1.style.gridArea = 'mainWindow';
  window1.style.display = 'inline';
  editButton.style.backgroundColor = '#2e3273';
  resultsButton.style.backgroundColor = 'transparent';
  consoleButton.style.backgroundColor = 'transparent';
  aboutButton.style.backgroundColor = 'transparent';
  errorButton.style.backgroundColor = 'transparent';
});
resultsButton.addEventListener('click', () => {
  window5.style.display = '';
  window5.style.gridArea = 'none';
  window4.style.gridArea = '';
  window4.style.display = 'none';
  window3.style.gridArea = '';
  window3.style.display = 'none';
  window1.style.gridArea = '';
  window1.style.display = 'none';
  window2.style.gridArea = 'mainWindow';
  window2.style.display = 'flex';
  editButton.style.backgroundColor = 'transparent';
  resultsButton.style.backgroundColor = '#2e3273';
  consoleButton.style.backgroundColor = 'transparent';
  aboutButton.style.backgroundColor = 'transparent';
  errorButton.style.backgroundColor = 'transparent';
});
consoleButton.addEventListener('click', () => {
  window5.style.display = '';
  window5.style.gridArea = 'none';
  window4.style.gridArea = '';
  window4.style.display = 'none';
  window3.style.gridArea = 'mainWindow';
  window3.style.display = 'flex';
  window1.style.gridArea = '';
  window1.style.display = 'none';
  window2.style.gridArea = '';
  window2.style.display = 'none';
  editButton.style.backgroundColor = 'transparent';
  resultsButton.style.backgroundColor = 'transparent';
  consoleButton.style.backgroundColor = '#2e3273';
  aboutButton.style.backgroundColor = 'transparent';
  errorButton.style.backgroundColor = 'transparent';
});
aboutButton.addEventListener('click', () => {
  window5.style.display = 'flex';
  window5.style.gridArea = 'mainWindow';
  window4.style.gridArea = '';
  window4.style.display = 'none';
  window3.style.gridArea = '';
  window3.style.display = 'none';
  window1.style.gridArea = '';
  window1.style.display = 'none';
  window2.style.gridArea = '';
  window2.style.display = 'none';
  editButton.style.backgroundColor = 'transparent';
  resultsButton.style.backgroundColor = 'transparent';
  consoleButton.style.backgroundColor = 'transparent';
  aboutButton.style.backgroundColor = '#2e3273';
  errorButton.style.backgroundColor = 'transparent';
});
errorButton.addEventListener('click', () => {
  window4.style.display = 'flex';
  window4.style.gridArea = 'mainWindow';
  window5.style.gridArea = '';
  window5.style.display = 'none';
  window3.style.gridArea = '';
  window3.style.display = 'none';
  window1.style.gridArea = '';
  window1.style.display = 'none';
  window2.style.gridArea = '';
  window2.style.display = 'none';
  editButton.style.backgroundColor = 'transparent';
  resultsButton.style.backgroundColor = 'transparent';
  consoleButton.style.backgroundColor = 'transparent';
  aboutButton.style.backgroundColor = 'transparent';
  errorButton.style.backgroundColor = '#2e3273';
});
