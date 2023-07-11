//Definitions
var circles = [],
  crosses = [],
  aiStarting = 0;
let count = 1,
  check = 2,
  stateLib = [],
  tempStates = [];
const turnToAiLimit = 1500;

function reset() {
  circles = [];
  crosses = [];
  tempStates = [];
  check = 2;
  aiStarting = 0;
  let box = document.getElementById("checker");
  box.style.visibility = "visible";
  for (let i = 1; i < 10; i++) {
    let k = i;
    changeImage("/AI/assets/cross.png", "img" + k.toString());
    hideImage(i);
    hideText("winner", "hidden");
    hideText("loser", "hidden");
  }
}
function changeImage(a, imgid) {
  document.getElementById(imgid).src = a;
}
function unhideImage(id) {
  let imgId = "img" + id.toString();
  let img = document.getElementById(imgId);
  img.style.visibility = "visible";
}
function hideImage(id) {
  let imgId = "img" + id.toString();
  let img = document.getElementById(imgId);
  img.style.visibility = "hidden";
}
function hideText(id, visibility) {
  let txt = document.getElementById(id);
  txt.style.visibility = visibility;
}
function win(arr) {
  if (arr.includes(1) && arr.includes(2) && arr.includes(3)) {
    return true;
  } else if (arr.includes(4) && arr.includes(5) && arr.includes(6)) {
    return true;
  } else if (arr.includes(7) && arr.includes(8) && arr.includes(9)) {
    return true;
  } else if (arr.includes(1) && arr.includes(4) && arr.includes(7)) {
    return true;
  } else if (arr.includes(2) && arr.includes(5) && arr.includes(8)) {
    return true;
  } else if (arr.includes(3) && arr.includes(6) && arr.includes(9)) {
    return true;
  } else if (arr.includes(1) && arr.includes(5) && arr.includes(9)) {
    return true;
  } else if (arr.includes(3) && arr.includes(5) && arr.includes(7)) {
    return true;
  } else {
    return false;
  }
}
class StateCreator {
  constructor(arrCross, arrCircle) {
    this.arrCross = arrCross;
    this.arrCircle = arrCircle;
    this.value = 0;
  }

  addCross(coords) {
    return this.arrCross.push(coords);
  }
  addCircle(coords) {
    return this.arrCircle.push(coords);
  }
  addValue(value) {
    this.value = value;
  }
}

/*
Problems and solutions:
3. Do a clean up/optimization
5. All first moves are negative, something with point giving?, also less overall states are probably positive. Solving problem 4 might help.
6. More complicated winPick that contains a strategy from start to finish.
8. Estimate draw and reset and add text
9. Make it possible to move old moves. Maximum 3 on the board
10. Premiums on draws?? Because many crossstart states are negative cuz of either draw or loss, on average.
11. Remove winMoves after turnToAILimit()
12. Remove 0 limit to random. Negative state value is still a state value.
*/

//Math.floor(Math.random() * (10 - 1) + 1)
//winPick(circles, crosses, "user")
function autoFeed(repeat) {
  let counter = 0;
  for (let i = 0; i < repeat; i++) {
    input(winPick(circles, crosses, "user"));
    counter++;
    console.log(counter);
  }
  reset();
  console.log("Finished");
  return;
}

function autoFeedaiStart(repeat) {
  let counter = 0;
  for (let i = 0; i < repeat; i++) {
    if (aiStarting == 0) {
      aiStart();
    }
    input(winPick(circles, crosses, "user"));
    counter++;
    console.log(counter);
  }
  reset();
  console.log("Finished");
  return;
}

function randomFeed(repeat) {
  for (let i = 0; i < repeat; i++) {
    input(Math.floor(Math.random() * (10 - 1) + 1));
  }
  reset();
  console.log("Finished");
  return;
}

function randomFeed(repeat) {
  for (let i = 0; i < repeat; i++) {
    if (aiStarting == 0) {
      aiStart();
    }
    input(Math.floor(Math.random() * (10 - 1) + 1));
  }
  reset();
  console.log("Finished");
  return;
}

//Non random pick
function winPick(circles, crosses, player) {
  const winMoves = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  if (
    (crosses.length == 0 && stateLib.length <= turnToAiLimit) ||
    (circles.length == 0 && stateLib.length <= turnToAiLimit)
  ) {
    console.log("Random first pick");
    return randomPick(circles, crosses);
  }
  if (player == "pc") {
    for (let i in winMoves) {
      for (let k in winMoves[i]) {
        let checkOpportunity = winMoves[i].slice(0);
        let missing = checkOpportunity.splice(k, 1);
        if (
          checkOpportunity.every((item) => circles.includes(item)) &&
          crosses.includes(missing[0]) !== true &&
          circles.includes(missing[0]) !== true
        ) {
          console.log("Winning move (pc)");
          return missing[0];
        }
      }
    }
    for (let i in winMoves) {
      for (let k in winMoves[i]) {
        let checkOpportunity = winMoves[i].slice(0);
        let missing = checkOpportunity.splice(k, 1);
        if (
          checkOpportunity.every((item) => crosses.includes(item)) &&
          circles.includes(missing[0]) !== true &&
          crosses.includes(missing[0]) !== true
        ) {
          console.log("A countermove (pc)");
          return missing[0];
        }
      }
    }
  }
  if (player == "user") {
    for (let i in winMoves) {
      for (let k in winMoves[i]) {
        let checkOpportunity = winMoves[i].slice(0);
        let missing = checkOpportunity.splice(k, 1);
        if (
          checkOpportunity.every((item) => crosses.includes(item)) &&
          crosses.includes(missing[0]) !== true &&
          circles.includes(missing[0]) !== true
        ) {
          console.log("Winning move (user)");
          return missing[0];
        }
      }
    }
    for (let i in winMoves) {
      for (let k in winMoves[i]) {
        let checkOpportunity = winMoves[i].slice(0);
        let missing = checkOpportunity.splice(k, 1);
        if (
          checkOpportunity.every((item) => circles.includes(item)) &&
          circles.includes(missing[0]) !== true &&
          crosses.includes(missing[0]) !== true
        ) {
          console.log("A countermove! (user)");
          return missing[0];
        }
      }
    }
  }
  if (player == "pc") {
    console.log("A completely random pick! (pc)");
    return randomPick(circles, crosses);
  }
  if (player == "user") {
    console.log("A completely random pick! (user)");
    return randomPick(circles, crosses);
  }
}
//Random pick
function randomPick(circleAmount, crossAmount) {
  while (count != 0) {
    let pcChoice = Math.floor(Math.random() * (10 - 1) + 1);
    if (!circleAmount.concat(crossAmount).includes(pcChoice)) {
      return pcChoice;
    }
    if (circleAmount.concat(crossAmount).length >= 9) {
      return 1;
    }
  }
}

function aiPick(circleAmount, crossAmount) {
  let passedStates = [],
    bestState = {},
    counter3 = -100000000000000;

  for (let i in stateLib) {
    for (let k in stateLib[i].arrCircle) {
      let checkStateCi = stateLib[i].arrCircle.slice(0);

      checkStateCi.splice(k, 1);
      if (
        checkStateCi.every((item) => circleAmount.includes(item)) &&
        stateLib[i].arrCross.every((item) => crossAmount.includes(item)) &&
        circleAmount.length + 1 == stateLib[i].arrCircle.length &&
        stateLib[i].arrCross.length == crossAmount.length
      ) {
        passedStates.push(stateLib[i]);
      }
    }
  }
  //  || circleAmount.length == 0
  if (
    passedStates.length == 0 ||
    (crossAmount.length == 1 && stateLib.length <= turnToAiLimit)
  ) {
    return winPick(circleAmount, crossAmount, "pc");
  }
  if (
    aiStarting == 1 &&
    circleAmount.length == 0 &&
    stateLib.length <= turnToAiLimit
  ) {
    return winPick(circleAmount, crossAmount, "pc");
  }

  console.log("passed states:");
  console.log(passedStates);
  for (let i in passedStates) {
    if (passedStates[i].value > counter3) {
      bestState = passedStates[i];
      counter3 = passedStates[i].value;
    }
  }
  let nextMove = bestState.arrCircle.filter(
    (item) => !circleAmount.includes(item)
  );

  //MIGHT BE A MISTAKE HERE
  //  || circleAmount.length == 0
  if (
    passedStates.length == 0 ||
    bestState.value < 0 ||
    crosses.includes(nextMove[0])
  ) {
    return winPick(circleAmount, crossAmount, "pc");
  }
  console.log(nextMove + " is the next move based on AI-choice");
  console.log("Best state:");
  console.log(bestState);
  if (circleAmount.concat(crossAmount).length == 0) {
    console.log("The board was blank before this move");
  } else {
    console.log(
      circleAmount.concat(crossAmount) + " was the situation on the board"
    );
  }
  return nextMove[0];
}

function reviewGame(statesArr, num) {
  let count = 0;
  if (statesArr.length == 0) {
    return null;
  }

  var state = statesArr[statesArr.length - 1];
  for (let i in stateLib) {
    if (
      stateLib[i].arrCross.every((item) => state.arrCross.includes(item)) &&
      stateLib[i].arrCircle.every((item) => state.arrCircle.includes(item)) &&
      stateLib[i].arrCross.length == state.arrCross.length &&
      stateLib[i].arrCircle.length == state.arrCircle.length
    ) {
      stateLib[i].value = stateLib[i].value + num;
      count = 1;
      //console.log("YAA")
      //console.log(state)
    }
  }
  if (count == 0) {
    state.addValue(num);
    stateLib.push(state);
  }
  return reviewGame(statesArr.slice(0, statesArr.length - 1), num / 10);
}

function aiStart() {
  aiStarting = 1;
  //Hiding the image after click

  let box = document.getElementById("checker");
  box.style.visibility = "hidden";

  let tempBoard = circles.concat(crosses);
  //Computers circle choice
  if (tempBoard.length < 8) {
    let pcChoice = aiPick(circles, crosses);
    //Computer choice implementation
    circles.push(pcChoice);
    tempBoard = circles.concat(crosses);
    unhideImage(pcChoice);
    changeImage("/AI/assets/circle.png", "img" + pcChoice.toString());
  }
  tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)));
  //Did pc win?
  if (win(circles)) {
    hideText("loser", "visible");
    check = 1;
    reviewGame(tempStates, 1);
    return;
  }
}

function input(position) {
  let box = document.getElementById("checker"),
    tempBoard = circles.concat(crosses),
    max = 8;
  box.style.visibility = "hidden";
  if (aiStarting == 1) {
    max = 9;
  }

  if (check == 1 || tempBoard.length >= 9) {
    reset();
    return;
  }
  if (!tempBoard.includes(position)) {
    //Players cross
    crosses.push(position);
    tempBoard.push(position);
    unhideImage(position);
    //Did user win?
    if (win(crosses)) {
      hideText("winner", "visible");
      check = 1;
      reviewGame(tempStates, -1);
      return;
    }

    //Computers circle choice
    if (tempBoard.length < max) {
      let pcChoice = aiPick(circles, crosses);
      //Computer choice implementation
      circles.push(pcChoice);
      tempBoard = circles.concat(crosses);
      unhideImage(pcChoice);
      changeImage("/AI/assets/circle.png", "img" + pcChoice.toString());
    }
    tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)));
    //Did pc win?
    if (win(circles)) {
      hideText("loser", "visible");
      check = 1;
      reviewGame(tempStates, 1);
      return;
    }
  }
}
