//Definitions
let count = 1, check = 2, stateLib = [], tempStates = [], jsonStates = []
var circles = [], crosses = [], aiStarting = 0, pickedUp = 0, aiConstantStart = 0, tempCross = 0, gameAmount = 0, tempStateLibFor3 = stateLib.slice(0), tempStateLibFor2 = stateLib.slice(0), feeding = 0
const turnToAiLimit = 2100

document.getElementById('contentFile').onchange = function(evt) {
    try {
        let files = evt.target.files;
        if (!files.length) {
            alert('No file selected!');
            return;
        }
        let file = files[0];
        let reader = new FileReader();
        const self = this;
        reader.onload = (event) => {
            console.log('FILE CONTENT', event.target.result);
            console.log(event.target.result)
            stateLib = JSON.parse(event.target.result)
            

        };
        reader.readAsText(file);
        console.log(reader)
    } catch (err) {
        console.error(err);
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
  // Start file download.
  

function clickToDownload() {
    download("hello.json", JSON.stringify(stateLib));
}









function alwaysAiStart() {
    if (aiConstantStart == 0) {aiConstantStart = 1; console.log("The pc will start every game from next game")}
    else if (aiConstantStart == 1) {aiConstantStart = 0; console.log("The pc will not start every game from next game")}
}

function reset() {
    circles = []
    crosses = []
    tempStates = []
    check = 2
    aiStarting = 0
    tempCross = 0
    console.log("Reset")
    gameAmount++

    let box = document.getElementById("checker");
    box.style.visibility = 'visible';
    pickedUp = 0
    for (let i = 1; i < 10; i++) {
        let k = i
        changeImage("/Projects/AI/assets/cross.png", "img" + k.toString())
        hideImage(i)
        hideText("winner", "hidden")
        hideText("loser", "hidden")
    }
    if (aiConstantStart == 1) {aiStart()}
}
function changeImage(a, imgid) {
    document.getElementById(imgid).src=a;
}
function unhideImage(id) {
    let imgId = "img" + id.toString()
    let img = document.getElementById(imgId);
    img.style.visibility = 'visible';
}
function hideImage(id) {
    let imgId = "img" + id.toString()
    let img = document.getElementById(imgId);
    img.style.visibility = 'hidden';
}
function hideText(id, visibility) {
    let txt = document.getElementById(id);
    txt.style.visibility = visibility;
}
function win(arr) {
    if (arr.includes(1) && arr.includes(2) && arr.includes(3)) {return true}
    else if (arr.includes(4) && arr.includes(5) && arr.includes(6)) {return true}
    else if (arr.includes(7) && arr.includes(8) && arr.includes(9)) {return true}
    else if (arr.includes(1) && arr.includes(4) && arr.includes(7)) {return true}
    else if (arr.includes(2) && arr.includes(5) && arr.includes(8)) {return true}
    else if (arr.includes(3) && arr.includes(6) && arr.includes(9)) {return true}
    else if (arr.includes(1) && arr.includes(5) && arr.includes(9)) {return true}
    else if (arr.includes(3) && arr.includes(5) && arr.includes(7)) {return true}
    else {return false}
}
class StateCreator {
    constructor(arrCross, arrCircle) {
        this.arrCross = arrCross
        this.arrCircle = arrCircle
        this.value = 0
    }

    addCross(coords) {
        return this.arrCross.push(coords)
    }
    addCircle(coords) {
        return this.arrCircle.push(coords)
    }
    addValue(value) {
        this.value = value
    }

}

function stateDuplicate(state) {
    stateSort(state)
    for (let i in state) {
        for (let k in state) {
            if (state[state.length -1 -i].arrCircle == state[k].arrCircle && state[state.length -1 -i].arrCross == state[k].arrCircle && state[state.length -1 -i].value != state[k].value) {
                let valueHolder = state.splice(state.length -1 -i, 1)
                state[k].value += valueHolder.value
            }

        }
    }
    return state
}


/*
Problems and solutions from before rework:
3. Do a clean up/optimization
Estimate draw and reset and add text
Remove winMoves after turnToAILimit(): I've just removed it totally from the AI side since it defeats the purpose. DONE
Remove 0 limit to random. Negative state value is still a state value. (This should turn on after 800 moves since it havent saved any states for the zero ones) Is this alright tho?

Current:
Random picks to feed itself // DONE
Trash feeding gives trash ai:
- Try feeding ai with ai
- Try feeding ai with winMoves
- Try giving ai winMoves
- Put these methods together
Feed with winMoves() or create a database



check through everything (test, check for mistakes and bugs), really messy, clean console.log
Also load random though
A refined learning user input system that takes care of all possibilities, and the pc should also try do !aiPick() and random instead until limit is reached and maybe try make it equal in a way but yet broad

Ai is only ai if it learns everything. Though I must make sure that it actually learns everything, which includes picking a random move even with an ai half of the times before turnToAiLimit?

Same numbers first two? From circles when aifeed()

#1 10000 autoFeed 10k total 2074 stateLib: 26.28
#2 10000 autoFeed 20k total ? stateLib: 54.37
#3 10000 autoFeed 30k total 2254 stateLib: 1:07.48
#4 10000 autoFeed 10k total 2090 stateLib, added console.log(tempStateLib): 30.28
#5 10000 randomFeed 20k total 2342 stateLib: 17.57 

Learned:
Make more function with more arguments so I avoid repetition


*/

//Math.floor(Math.random() * (10 - 1) + 1)
//winPick(circles, crosses, "user")
function autoFeed(repeat) {
    let counter = 0
    feeding = 1
    for (let i = 0; i < repeat; i++) {
        let choice = winPick(circles, crosses, "user")
        console.log(choice)
        if (Array.isArray(choice)) {
            input(choice[1][0])
            input(choice[0][0])
        } else {
            input(choice)
        }
        counter++
        console.log(counter)
    }
    reset()
    feeding = 0
    console.log("Finished")
    return;
}

function autoFeedaiStart(repeat) {
    let counter = 0
    feeding = 1
    for (let i = 0; i < repeat; i++) {
        if (aiStarting == 0) {
            aiStart()
        }
        console.log(circles)
        console.log(crosses)
        let choice = winPick(circles, crosses, "user")
        console.log(choice)
        if (Array.isArray(choice)) {
            input(choice[1][0])
            input(choice[0][0])
        } else if (!Array.isArray(choice)){
            input(choice)
        }
        counter++
        console.log(counter)
        if (win(crosses) || win(circles)) {input(0)}
    }
    reset()
    feeding = 0
    console.log("Finished")
    return;
}

function randomFeed(repeat) {
    let counter = 0
    feeding = 1
    for (let i = 0; i < repeat; i++) {
        input(Math.floor(Math.random() * (10 - 1) + 1))
        counter++
        console.log(counter)
    }
    reset()
    feeding = 0
    console.log("Finished")
    return;
}

function randomFeedaiStart(repeat) {
    let counter = 0
    feeding = 1
    for (let i = 0; i < repeat; i++) {
        if (aiStarting == 0) {
            aiStart()
        }
        input(Math.floor(Math.random() * (10 - 1) + 1))
        counter++
        console.log(counter)
    }
    reset()
    feeding = 0
    console.log("Finished")
    return;
}

var coun = 0, coun2 = 0

//Non random pick
function winPick(circles, crosses, player) {
    const winMoves = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]]
    if (crosses.length == 0 && stateLib.length <= turnToAiLimit || circles.length == 0 && stateLib.length <= turnToAiLimit) {console.log("Random first pick"); return randomPick(circles, crosses, player)}
    
    if (player == "user" && crosses.length <= 2) {
        for (let i in winMoves) {
            for (let k in winMoves[i]) {
                let checkOpportunity = winMoves[i].slice(0)
                let missing = checkOpportunity.splice(k, 1)
                if (checkOpportunity.every(item => crosses.includes(item)) && crosses.includes(missing[0]) !== true && circles.includes(missing[0]) !== true) {
                    console.log("Winning move (user)")
                    coun2++
                    return missing[0]
                }
            }
        }
        for (let i in winMoves) {
            for (let k in winMoves[i]) {
                let checkOpportunity = winMoves[i].slice(0)
                let missing = checkOpportunity.splice(k, 1)
                if (checkOpportunity.every(item => circles.includes(item)) && circles.includes(missing[0]) !== true && crosses.includes(missing[0]) !== true) {
                    console.log("A countermove! (user)")
                    return missing[0]
                }
            }
        }
    }





    else if (player == "user") {
        for (let y in crosses) {
            let tempCrosses = crosses.slice(0)
            let toDelete = tempCrosses.splice(y, 1)
            // [1, 2, 5] => [1, 2]
            for (let i in winMoves) {
                for (let k in winMoves[i]) {
                    let checkOpportunity = winMoves[i].slice(0)
                    let missing = checkOpportunity.splice(k, 1)
                    if (checkOpportunity.every(item => tempCrosses.includes(item)) && tempCrosses.includes(missing[0]) !== true && circles.includes(missing[0]) !== true && missing != toDelete) {
                        console.log("Winning move (user)")
                        coun++
                        return [missing, toDelete]
                    }
                }
            }
        }
        for (let y in crosses) {
            let tempCrosses = crosses.slice(0)
            let toDelete = tempCrosses.splice(y, 1)
            for (let i in winMoves) {
                for (let k in winMoves[i]) {
                    let checkOpportunity = winMoves[i].slice(0)
                    let missing = checkOpportunity.splice(k, 1)
                    if (checkOpportunity.every(item => circles.includes(item)) && circles.includes(missing[0]) !== true && crosses.includes(missing[0]) !== true && missing != toDelete) {
                        console.log("A countermove! (user)")
                        return [missing, toDelete]
                    }
                }
            }
        }
    }
    if (player == "user" && crosses.length <= 2) {return randomPick(circles, crosses, "user")}
    if (player == "user") {
        return pickedUpRandomPick(circles, crosses, "user")
    }
}
//Random pick
function randomPick(circleAmount, crossAmount, player) {
    while (count != 0) {
        let pcChoice = Math.floor(Math.random() * (10 - 1) + 1)
        if (!circleAmount.concat(crossAmount).includes(pcChoice)) {
            if (player == "pc") {
                console.log("A completely random pick! (pc)")}
            if (player == "user") {
                console.log("A completely random pick! (user)")}
            return pcChoice;
        }
        if (circleAmount.concat(crossAmount).length >= 9) {return 1;}
    }
}

function pickedUpRandomPick(circleAmount, crossAmount, player) {
    console.log(crossAmount)
    
    if (player == "user") {
        while (count != 0) {
            let rando = Math.floor(Math.random() * (crossAmount.length -1 - 0 + 1) + 0)
            let pcChoice = [[Math.floor(Math.random() * (10 - 1) + 1)], [crossAmount[rando]]]
            if (!circleAmount.concat(crossAmount).includes(pcChoice[0][0])) {
                console.log("A completely random pick! (user)")
                return pcChoice;
            }
        }
    }
    if (player == "pc") {
        while (count != 0) {
            let rando = Math.floor(Math.random() * (circleAmount.length -1 - 0 + 1) + 0)
    
            let pcChoice = [[Math.floor(Math.random() * (10 - 1) + 1)], [circleAmount[rando]]]
    
            if (!circleAmount.concat(crossAmount).includes(pcChoice[0][0])) {
                console.log("A completely random pick! (pc)")
                return pcChoice;
            }
           
        }
    }
    

        //if (circleAmount.concat(crossAmount).length >= 9) {return 1;}
    
}


function aiPick(circleAmount, crossAmount) {
    let passedStates = [], bestState = {}, counter3 = -100000000000000, randomChance = Math.random() * (3-0.01) + 0.01
    if (win(crossAmount)) {return}
    
    if (pickedUp == 1) {
        if (randomChance >= 1 && feeding == 1) {
            return pickedUpRandomPick(circleAmount, crossAmount, "pc")
        }
        let tempStateLib = tempStateLibFor3
        //Reducing with cross
        //for (let i in crossAmount) {
        //    tempStateLib.filter(item => item.arrCross.includes(crossAmount[i]))
        //}
        tempStateLib.filter(item => crossAmount.every(stuff => item.arrCross.includes(stuff)))
        //Reducing through circles
        for (let k = tempStateLib.length - 1; k >= 0; k--) {
            let counter = 0
            for (let i in circleAmount) {
                if (tempStateLib[k].arrCircle.includes(circleAmount[i])) {counter++}
            }
            if (counter < 2) {tempStateLib.splice(k, 1)}
        }

        console.log(tempStateLib)
        for (let y in circleAmount) {
            let tempCircles = circleAmount.slice(0)
            tempCircles.splice(y, 1)
            //[1, 2, 5] => [2, 5]
            for (let i in tempStateLib) {
                for (let k in tempStateLib[i].arrCircle) {
                    let checkStateCi = tempStateLib[i].arrCircle.slice(0)
                    checkStateCi.splice(k, 1)
                    //[5, 2, 7] => [2, 5]
                    if (checkStateCi.every(item => tempCircles.includes(item)) && tempStateLib[i].arrCross.every(item => crossAmount.includes(item)) && tempCircles.length + 1 == tempStateLib[i].arrCircle.length && tempStateLib[i].arrCross.length == crossAmount.length) {
                        if (!passedStates.includes(tempStateLib[i])) {passedStates.push(tempStateLib[i])}
                    }
                }
            }
        }


        for (let i in passedStates) {
            if (passedStates[i].value > counter3) {
                bestState = passedStates[i]
                counter3 = passedStates[i].value
            }
        }
        if (passedStates.length == 0 || bestState.value < 0 && stateLib.length <= turnToAiLimit || stateLib.length <= turnToAiLimit || crossAmount.length == 1 && stateLib.length <= turnToAiLimit || aiStarting == 1 && circleAmount.length == 0 && stateLib.length <= turnToAiLimit) {
            return pickedUpRandomPick(circleAmount, crossAmount, "pc")
        }
        console.log("passed states:")
        console.log(passedStates)
        let nextMoveArr = [bestState.arrCircle.filter(item => !circleAmount.includes(item)), circleAmount.filter(item => !bestState.arrCircle.includes(item))]
        if (nextMoveArr[0][0] >= 0 != true && nextMoveArr[1][0] >= 0 != true) {return pickedUpRandomPick(circleAmount, crossAmount, "pc")}
        console.log(nextMoveArr)
        console.log(nextMoveArr[0] + " is the next move based on AI-choice")
        console.log("Best state:")
        console.log(bestState)
        console.log(circleAmount.concat(crossAmount) + " was the situation on the board")
        return nextMoveArr;
    }



//OLD
    if (pickedUp == 0) {
        if (randomChance >= 1 && feeding == 1) {
            return randomPick(circleAmount, crossAmount, "pc")
        }

        let tempStateLib = tempStateLibFor2
       
        for (let i in tempStateLib) {
            for (let k in tempStateLib[i].arrCircle) {
                let checkStateCi = tempStateLib[i].arrCircle.slice(0)

                checkStateCi.splice(k, 1)
                if (checkStateCi.every(item => circleAmount.includes(item)) && tempStateLib[i].arrCross.every(item => crossAmount.includes(item)) && circleAmount.length + 1 == tempStateLib[i].arrCircle.length && tempStateLib[i].arrCross.length == crossAmount.length) {
                    passedStates.push(tempStateLib[i])
                }
            }
        }
        //  Changing winPick() to randomPick() for AI fairness
        if (passedStates.length == 0 || crossAmount.length == 1 && stateLib.length <= turnToAiLimit) {
            return randomPick(circleAmount, crossAmount, "pc")
        }
        if (aiStarting == 1 && circleAmount.length == 0 && stateLib.length <= turnToAiLimit) {
            return randomPick(circleAmount, crossAmount, "pc")
        }

        console.log("passed states:")
        console.log(passedStates)
        for (let i in passedStates) {
            if (passedStates[i].value > counter3) {
                bestState = passedStates[i]
                counter3 = passedStates[i].value
            }
        }
        let nextMove = bestState.arrCircle.filter(item => !circleAmount.includes(item))
        
        //MIGHT BE A MISTAKE HERE
        //  ||  bestState.value < 0 || crosses.includes(nextMove[0]) 09/01 17:07
        if (passedStates.length == 0 || bestState.value < 0 && stateLib.length <= turnToAiLimit) {
            return randomPick(circleAmount, crossAmount, "pc")
        }
        console.log(nextMove + " is the next move based on AI-choice")
        console.log("Best state:")
        console.log(bestState)
        if (circleAmount.concat(crossAmount).length == 0) {
            console.log("The board was blank before this move")
        } else {
            console.log(circleAmount.concat(crossAmount) + " was the situation on the board")
        }
        return nextMove[0];
    }   
}


function reviewGame(statesArr, num) {
    let count = 0
    if (statesArr.length == 0) {
        return null;
    }

    var state = statesArr[statesArr.length-1]
    for (let i in stateLib) {
        if (stateLib[i].arrCross.every(item => state.arrCross.includes(item)) && stateLib[i].arrCircle.every(item => state.arrCircle.includes(item)) && stateLib[i].arrCross.length == state.arrCross.length && stateLib[i].arrCircle.length == state.arrCircle.length) {
            stateLib[i].value = stateLib[i].value + num
            count = 1
        } 
    }
    if (count == 0) {
        state.addValue(num)
        stateLib.push(state)
    }
    stateSort(stateLib)
    //Reducing with length
    tempStateLibFor3 = stateLib.slice(0)
    for (let i = tempStateLibFor3.length - 1; i >= 0; i--) {
        if (tempStateLibFor3[i].arrCircle.length == 3) {
        } else {tempStateLibFor3.splice(i, 1,)}
    }
    tempStateLibFor3.sort((a, b) => a.arrCircle[a.arrCircle.length - 1] - b.arrCircle[a.arrCircle.length - 1])
    tempStateLibFor2 = stateLib.slice(0)
        for (let i = tempStateLibFor2.length - 1; i >= 0; i--) {
            if (tempStateLibFor2[i].arrCircle.length != 3) {
            } else {tempStateLibFor2.splice(i, 1,)}
        }
    tempStateLibFor2.sort((a, b) => a.arrCircle[a.arrCircle.length - 1] - b.arrCircle[a.arrCircle.length - 1])

    return reviewGame(statesArr.slice(0, statesArr.length-1), num / 10)

}

function aiStart() {
    aiStarting = 1
    //Hiding the image after click
    let box = document.getElementById("checker");
    box.style.visibility = 'hidden';

  
    let tempBoard = circles.concat(crosses)
    //Computers circle choice
    if (tempBoard.length < 8) {
        let pcChoice = aiPick(circles, crosses)
        //Computer choice implementation
        circles.push(pcChoice)
        tempBoard = circles.concat(crosses)
        unhideImage(pcChoice)
        changeImage("/Projects/AI/assets/circle.png", "img" + pcChoice.toString())
        
    }
    tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)))
    //Did pc win?
    if (win(circles)) {
        hideText("loser", "visible")
        check = 1
        reviewGame(tempStates, 1)
        return
    }
}

function input(position) {
    let box = document.getElementById("checker"), tempBoard = circles.concat(crosses), max = 8
    box.style.visibility = 'hidden';
    if (aiStarting == 1) {max = 6}

    if (check == 1 || tempBoard.length >= 9) {reset(); return}
    
    tempBoard = circles.concat(crosses)

    if (tempCross == position) {}
    else if (pickedUp == 1 && !tempBoard.includes(position) && crosses.length < 3 ) {
        crosses.push(position)
        tempBoard = circles.concat(crosses)
        //changeImage("/Projects/AI/assets/cross.png", "img" + position.toString())
        unhideImage(position)
        if (win(crosses)) {
            hideText("winner", "visible")
            check = 1
            reviewGame(tempStates, -1)
            return
        }
        //ai's turn
        let pcChoice = aiPick(circles, crosses)
        console.log("pcChoice")
        console.log(pcChoice)
        let a = circles.splice(circles.indexOf(pcChoice[1][0]), 1)
        changeImage("/Projects/AI/assets/white.png", "img" + pcChoice[1][0].toString())
        hideImage(pcChoice[1][0])
        changeImage("/Projects/AI/assets/cross.png", "img" + pcChoice[1][0].toString())
        circles.push(pcChoice[0][0])
        tempBoard = circles.concat(crosses)
        changeImage("/Projects/AI/assets/circle.png", "img" + pcChoice[0][0].toString())
        unhideImage(pcChoice[0][0])
        tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)))
        pickedUp = 0
        //Did pc win?
        if (win(circles)) {
            hideText("loser", "visible")
            check = 1
            reviewGame(tempStates, 1)
            return
        }
    } else if (crosses.length >= 3 && crosses.includes(position)) {
        tempCross = crosses.splice(crosses.indexOf(position), 1)
        pickedUp = 1
        tempBoard = circles.concat(crosses)
        hideImage(position)
    
    } 
    
    if (!tempBoard.includes(position) && crosses.length < 3 && pickedUp != 1) {
        //Players cross
        crosses.push(position)
        tempBoard = circles.concat(crosses)
        unhideImage(position)
        //Did user win?
        if (win(crosses)) {
            console.log("Won")
            hideText("winner", "visible")
            check = 1
            reviewGame(tempStates, -1)
            return
        }
        
        //Computers circle choice
        if (circles.length == 3) {
            pickedUp = 1
            let pcChoice = aiPick(circles, crosses)
            let a = circles.splice(circles.indexOf(pcChoice[1][0]), 1)
            changeImage("/Projects/AI/assets/white.png", "img" + pcChoice[1][0].toString())
            hideImage(pcChoice[1][0])
            changeImage("/Projects/AI/assets/cross.png", "img" + pcChoice[1][0].toString())
            circles.push(pcChoice[0][0])
            tempBoard = circles.concat(crosses)
            changeImage("/Projects/AI/assets/circle.png", "img" + pcChoice[0][0].toString())
            unhideImage(pcChoice[0][0])
            tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)))
            pickedUp = 0
            //Did pc win?
            if (win(circles)) {
                hideText("loser", "visible")
                check = 1
                reviewGame(tempStates, 1)
                return
            }
        }
        if (tempBoard.length < max) {
            let pcChoice = aiPick(circles, crosses)
            //Computer choice implementation
            changeImage("/Projects/AI/assets/circle.png", "img" + pcChoice.toString())
            circles.push(pcChoice)
            tempBoard = circles.concat(crosses)
            unhideImage(pcChoice)
        }
        tempStates.push(new StateCreator(crosses.slice(0), circles.slice(0)))
        //Did pc win?
        if (win(circles)) {
            hideText("loser", "visible")
            check = 1
            reviewGame(tempStates, 1)
            return
        }
        }
}

function stateSort(stateLibrary) {
    stateLibrary.map(item => { item.arrCircle.sort((a,b) => a - b); item.arrCross.sort((a,b) => a - b)})
    stateLibrary.sort((a, b) => a.arrCircle.length - b.arrCircle.length)
}












