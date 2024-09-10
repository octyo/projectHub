/* 
Introducing notes:
    - New and better version of a neural network
    - Challenge: Coded with no AI help
    - New features: Modularized code and more use of class functionalities

Functionalities & structure:
    - Create a neural network structure with layers, weight matrix, bias vector/matrix. Triggers on initialization of class instance
        - Generate weights and biases _DONE_
        - Add custom parameters _DONE_ //Still dangerous though, no way of checking it easily
        - Choose weight initialization
        - Choose activation functions
        - Give a standardized configs object
    - Forward prop. Inputs: Dataset with output as well. Output: Error
    - Backward prop. Batching. Regulization (later). Input: Batch size, Learning rate, To output parameters(True/False). Output: Error 
        - Custom error function (Current MSE)
    - Change neuron structure.
    - Future: More math and async full end-2-end system programming.

    Critical missing points (Current is "hardcoded"):
        - Custom error function
        - Custom activation functions and the backprop for it

Input example: 
    let neuralNetworkInstance = new Neural([100, 8, 9, 2], "random", "ReLU", "Sigmoid", {custom: False, parameters: [[]]})
    neuralNetworkInstance.forwardProp(dataset)
    neuralNetworkInstance.backwardProp(dataset, {batching: 100, outputParams: True, learningRate: 0.001})
    weights: w^[1]_2

*/

interface Params {
  ["weights"]: Array<ParamsSingularLayer["weights"]>; // [layers[neuronsRightSide[weightsToLeft]]] ||THIS WORKS BTW? NESTING INTERFACE and [""] index in it
  ["bias"]: Array<ParamsSingularLayer["bias"]>; // [layers[neuronsRightBias]]
}

interface ParamsSingularLayer {
  ["weights"]: Array<Array<number>>; //[neurons[weights]]
  ["bias"]: Array<number>; //[neuronsbias]
}

interface NeuralConfigs {
  ["paramInit"]: "random" | "normal distribution";
  ["activationFunc"]: "ReLU" | "Sigmoid";
  ["lastActivationFunc"]: "Sigmoid" | "Standard";
  ["activationFunc"]: "ReLU" | "Sigmoid";
  ["parameters"]: Params | null;
}

class NeuralNetworkClass {
  //Declare variables
  layerStructureArr: Array<number>;
  configsObj: NeuralConfigs;
  params: Params;
  constructor(layerStructureArr: Array<number>, configsObj: NeuralConfigs) {
    this.layerStructureArr = layerStructureArr;
    this.configsObj = configsObj;
    this.params =
      configsObj["parameters"] == null
        ? { ["weights"]: [], ["bias"]: [] }
        : configsObj["parameters"];
    this.init();
  }
  init(): void {
    if (this.configsObj["parameters"] == null) {
      for (let i = 0; i < this.layerStructureArr.length - 1; i++) {
        let { weights, bias } = this.createParams(
          this.layerStructureArr[i],
          this.layerStructureArr[i + 1]
        );
        this.params["weights"].push(weights);
        this.params["bias"].push(bias);
      }
    }
  }

  forwardProp(dataset: Array<Array<number>>, answers: Array<Array<number>>): any {
    //[datasets[data]] & [datasets[answer]]
    let output: any = {
      ["errors"]: [],
      ["AneuronValues"]: [],
      ["ZneuronValues"]: [],
      ["answers"]: [],
    };
    for (let o in dataset) {
      //Every dataset
      if (dataset[o].length !== this.layerStructureArr[0]) break;
      let neuronValues: Array<any> = [dataset[o]];
      let ZneuronValues: Array<Array<number>> = [dataset[o]];
      for (let i = 1; i < this.layerStructureArr.length; i++) {
        //Every layer - 1 (So, every middle)
        neuronValues.push([]), ZneuronValues.push([]);
        for (let j = 0; j < this.layerStructureArr[i]; j++) {
          //Every neuron, ignoring dataset layer
          let value =
            this.dotProduct(neuronValues[i - 1], this.params["weights"][i - 1][j]) +
            this.params["bias"][i - 1][j];
          ZneuronValues[i].push(value);
          neuronValues[i].push(
            i == this.layerStructureArr.length - 1 || this.configsObj["activationFunc"] == "Sigmoid"
              ? this.sigmoid(value)
              : this.ReLU(value)
          );
        }
      }
      output["ZneuronValues"].push(ZneuronValues), output["AneuronValues"].push(neuronValues);
      output["answers"].push(answers[o]);
      output["errors"].push(this.MSE(neuronValues[this.layerStructureArr.length - 1], answers[o])); //.map((x:number) => x *255)
    }
    return output;
    //Errors[numPerDataset], NeuronValues[datasets[layers[neuron1, neuron2]]],
    //ZNeuronValues[datasets[layers[neuron1, neuron2]]]
  }

  matrixMultiplication(matrixA: Array<Array<number>>, matrixB: Array<Array<number>>) {
    let matrixAB: any = [];
    let matrixBTransposed = matrixB[0].map((col, i) => matrixB.map((row) => row[i]));

    if (matrixA[0].length !== matrixB.length) return null;
    for (let matrixAHeight = 0; matrixAHeight < matrixA.length; matrixAHeight++) {
      matrixAB.push([]);
      for (let matrixBLength = 0; matrixBLength < matrixB[0].length; matrixBLength++) {
        matrixAB[matrixAHeight].push(
          this.dotProduct(matrixA[matrixAHeight], matrixBTransposed[matrixBLength])
        );
      }
    }
    return matrixAB;
  }

  backwardProp(
    dataset: Array<Array<number>>,
    answers: Array<Array<number>>,
    testDataset: Array<Array<number>>,
    testDataAnswer: Array<Array<number>>,
    learningRate: number,
    batchSize: number,
    regulization: boolean,
    epoch: number
  ) {
    let errorTrack: Array<number> = [];
    let arrOfCorrectPercentage: Array<number> = [];
    //Epoch
    for (let epo = 0; epo < epoch; epo++) {
      console.log("Epo: ", epo);
      //Randomize dataset order
      if (learningRate >= 1 || dataset.length !== answers.length) {
        console.error("Input Error");
      }
      let { randomizedDataset, randomizedAnswers } = this.randomizeDataset(dataset, answers);

      //Call forwardprop, take error and all calculated values must be stored and returned as well
      let numOfIterations = Math.ceil(randomizedDataset.length / batchSize);
      for (let i = 0; i < numOfIterations; i++) {
        let batchData =
          i == numOfIterations - 1 ? randomizedDataset : randomizedDataset.splice(0, batchSize);
        let batchAnswers =
          i == numOfIterations - 1 ? randomizedAnswers : randomizedAnswers.splice(0, batchSize);
        let output = this.forwardProp(batchData, batchAnswers);
        //Calculate aGradients
        let aGradients = this.aGradientCalculator(
          batchAnswers,
          output["AneuronValues"],
          output["ZneuronValues"]
        );
        //Calculate weight and bias gradients
        let { weightGradients, biasGradients } = this.weightBiasGradient(
          aGradients,
          output["AneuronValues"],
          output["ZneuronValues"]
        );
        //Update variables based on average gradient
        let { avgWeightGradients, avgBiasGradients } = this.avgGradients(
          weightGradients,
          biasGradients
        );
        for (let layers = 0; layers < this.layerStructureArr.length; layers++) {
          for (
            let neuronRight = 0;
            neuronRight < this.layerStructureArr[layers + 1];
            neuronRight++
          ) {
            //Bias
            this.params["bias"][layers][neuronRight] -=
              learningRate * avgBiasGradients[layers][neuronRight];
            for (let neuronLeft = 0; neuronLeft < this.layerStructureArr[layers]; neuronLeft++) {
              //Weights
              this.params["weights"][layers][neuronRight][neuronLeft] -=
                learningRate * avgWeightGradients[layers][neuronRight][neuronLeft];
            }
          }
        }
        //Gem nøjagtighed
        let correct: number = 0;
        for (let i: number = 0; i < output["AneuronValues"].length; i++) {
          //Every dataset
          let maxNeuron = output["AneuronValues"][i][output["AneuronValues"][i].length - 1].reduce(
            (a: number, b: number) => Math.max(a, b)
          );
          let indexOfMax: number =
            output["AneuronValues"][i][output["AneuronValues"][i].length - 1].indexOf(maxNeuron);
          if (batchAnswers[i][indexOfMax] == 1) {
            correct++;
          }
        }
        arrOfCorrectPercentage.push(correct / output["AneuronValues"].length);
      }

      //Test accuracy
      let output = this.forwardProp(testDataset, testDataAnswer);
      let correct: number = 0;
      for (let i: number = 0; i < output["AneuronValues"].length; i++) {
        //Every dataset
        let maxNeuron = output["AneuronValues"][i][output["AneuronValues"][i].length - 1].reduce(
          (a: number, b: number) => Math.max(a, b)
        );
        let indexOfMax: number =
          output["AneuronValues"][i][output["AneuronValues"][i].length - 1].indexOf(maxNeuron);
        if (testDataAnswer[i][indexOfMax] == 1) {
          correct++;
        }
      }
      console.log(correct / output["AneuronValues"].length);
    }
    this.createFile(arrOfCorrectPercentage);
    console.log(arrOfCorrectPercentage);
  }

  createFile(errorTrack: Array<number>) {
    const fs = require("fs");

    const arrayData = [errorTrack];

    // Convert array to CSV format
    const csvData = arrayData.map((row) => row.join(",")).join("\n");

    // Write CSV data to file
    fs.writeFile("./data3.csv", csvData, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Created CSV file");
    });
  }

  aGradientCalculator(
    answers: Array<Array<number>>,
    AneuronValues: Array<Array<Array<number>>>,
    ZneuronValues: Array<Array<Array<number>>>
  ) {
    let arr: any = []; //[datasets[layer[neurons]]] [[[1, 1, 1], [1, 1, 1]]]
    for (let i = 0; i < answers.length; i++) {
      //Per dataset
      arr.push([]); //[[]]
      arr[i].unshift(
        this.vectorMinus(AneuronValues[i][AneuronValues[i].length - 1], answers[i]).map(
          (x) => x * 2
        )
      );
      for (let j = this.layerStructureArr.length - 1 - 1; j > 0; j--) {
        //Per layer
        arr[i].unshift([]);
        for (let k = 0; k < this.layerStructureArr[j]; k++) {
          //Focus on left neuron
          let tempArrForGradient: Array<number> = [];
          for (let o = 0; o < this.layerStructureArr[j + 1]; o++) {
            //Iterate through right neurons
            let derivativeZ =
              j == this.layerStructureArr.length - 2 ||
              this.configsObj["activationFunc"] == "Sigmoid"
                ? this.sigmoidDerivative(ZneuronValues[i][j + 1][o])
                : this.ReLUDerivative(ZneuronValues[i][j + 1][o]);
            let value = +this.params["weights"][j][o][k] * derivativeZ * arr[i][1][o];
            tempArrForGradient.push(value);
          }
          let aGradient = tempArrForGradient.reduce((a: number, b: number) => a + b);
          arr[i][0].push(aGradient);
        }
      }
    }
    return arr;
  }
  weightBiasGradient(
    aGradients: Array<Array<Array<number>>>,
    AneuronValues: Array<Array<Array<number>>>,
    ZneuronValues: Array<Array<Array<number>>>
  ) {
    let weightGradients: any = []; //[datasets[layers[neuronsRightSide[weightsToLeft]]]]
    let biasGradients: any = [];
    for (let datasets = 0; datasets < AneuronValues.length; datasets++) {
      weightGradients.push([]), biasGradients.push([]); // [[dataset]]
      for (let layers = 1; layers < this.layerStructureArr.length; layers++) {
        weightGradients[datasets].push([]), biasGradients[datasets].push([]); //[[[layer]]]
        for (let neuronsRight = 0; neuronsRight < this.layerStructureArr[layers]; neuronsRight++) {
          weightGradients[datasets][layers - 1].push([]),
            biasGradients[datasets][layers - 1].push([]); //[[[[neuronRight]]]]
          //Weights
          let derivativeZ =
            layers == this.layerStructureArr.length - 1 ||
            this.configsObj["activationFunc"] == "Sigmoid"
              ? this.sigmoidDerivative(ZneuronValues[datasets][layers][neuronsRight])
              : this.ReLUDerivative(ZneuronValues[datasets][layers][neuronsRight]);

          for (
            let neuronsLeft = 0;
            neuronsLeft < this.layerStructureArr[layers - 1];
            neuronsLeft++
          ) {
            let value =
              AneuronValues[datasets][layers - 1][neuronsLeft] *
              derivativeZ *
              aGradients[datasets][layers - 1][neuronsRight];
            weightGradients[datasets][layers - 1][neuronsRight].push(value);
          }
          //Bias
          let value2 = derivativeZ * aGradients[datasets][layers - 1][neuronsRight];
          biasGradients[datasets][layers - 1][neuronsRight].push(value2);
        }
      }
    }
    return { weightGradients, biasGradients };
  }

  avgGradients(weightGradients: Array<Params["weights"]>, biasGradients: Array<Params["bias"]>) {
    let avgWeightGradients: Params["weights"] = weightGradients[0];
    let avgBiasGradients: Params["bias"] = biasGradients[0];
    for (let layers = 0; layers < this.layerStructureArr.length - 1; layers++) {
      // [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]
      for (let neuron = 0; neuron < this.layerStructureArr[layers + 1]; neuron++) {
        for (let neuronsLeft = 0; neuronsLeft < this.layerStructureArr[layers]; neuronsLeft++) {
          for (let datasets = 1; datasets < weightGradients.length; datasets++) {
            if (datasets == 1)
              avgWeightGradients[layers][neuron][neuronsLeft] =
                avgWeightGradients[layers][neuron][neuronsLeft] / weightGradients.length +
                weightGradients[datasets][layers][neuron][neuronsLeft];
            else
              avgWeightGradients[layers][neuron][neuronsLeft] +=
                weightGradients[datasets][layers][neuron][neuronsLeft] / weightGradients.length;
            if (neuronsLeft == 0) {
              if (datasets == 1) {
                avgBiasGradients[layers][neuron] =
                  avgBiasGradients[layers][neuron] / weightGradients.length +
                  biasGradients[datasets][layers][neuron] / weightGradients.length;
              } else
                avgBiasGradients[layers][neuron] +=
                  biasGradients[datasets][layers][neuron] / weightGradients.length;
            }
          }
        }
      }
    }
    return { avgWeightGradients, avgBiasGradients };
  }

  sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  // sigmoidDerivative2(x: number) {
  //   return this.sigmoid(x) * (1 - this.sigmoid(x));
  // }

  sigmoidDerivative(x: number) {
    return Math.exp(-x) / (2 * Math.exp(-x) + Math.exp(-x) ** 2 + 1);
  }

  ReLU(x: number) {
    return x > 0 ? x : 0;
  }

  ReLUDerivative(x: number) {
    return x > 0 ? 1 : 0;
  }

  MSE(networkAnswersyhat: Array<number>, desiredAnswersy: Array<number>): number {
    let arr: Array<number> = [];
    for (let i in networkAnswersyhat) {
      arr.push((networkAnswersyhat[i] - desiredAnswersy[i]) ** 2);
    }
    let average: number = arr.reduce((a, b) => a + b) / desiredAnswersy.length;
    return average;
  }

  dotProduct(vector1: Array<number>, vector2: Array<number>): number {
    let result: Array<number> | number = vector1.map((x: number, i: number) => x * vector2[i]);
    result = result.reduce((a: number, b: number) => a + b);
    return result;
  }

  vectorMinus(vector1: Array<number>, vector2: Array<number>) {
    let result = vector1.map((x, i) => x - vector2[i]);
    return result;
  }

  createParams(neuronsLeft: number, neuronsRight: number): ParamsSingularLayer {
    if (this.configsObj["paramInit"] == "random") {
      let weights: Array<Array<number>> = [],
        bias: Array<number> = [];
      for (let i = 0; i < neuronsRight; i++) {
        weights.push([...Array(neuronsLeft)].map(() => Math.random() * 2 - 1));
      }
      for (let i = 0; i < neuronsRight; i++) {
        bias.push(Math.random() * 2 - 1);
      }
      return { ["weights"]: weights, ["bias"]: bias };
    }
    return { ["weights"]: [[1]], ["bias"]: [1] };
  }

  randomizeDataset(dataset: Array<Array<number>>, answers: Array<Array<number>>) {
    let randomizedDataset: Array<Array<number>> = [dataset[0]],
      randomizedAnswers: Array<Array<number>> = [answers[0]];
    for (let i = 1; i < dataset.length; i++) {
      let randomValue = Math.round(Math.random() * (i - 1)); // 3 * 0.9 = 0 || [1, 2, 3]
      randomizedDataset.splice(randomValue, 0, dataset[i]);
      randomizedAnswers.splice(randomValue, 0, answers[i]);
    }
    return { randomizedDataset, randomizedAnswers };
  }
}

//Dataset
const fs = require("fs");

const filePath = "./mnist_train.csv";
const filePath2 = "./mnist_test.csv";

fs.readFile(filePath, "utf8", (err: any, data: any) => {
  if (err) {
    console.error(err);
    return;
  }

  let rows = data.split("\n");
  let dataset: any = rows.map((row: any) => row.split(","));
  let answers: any = [];

  let tempDataset: Array<Array<number>> = [];
  for (let o in dataset) {
    if (+dataset[o][0] <= 9) {
      tempDataset.push(dataset[o]);
    }
  }
  dataset = tempDataset;

  for (let i in dataset) {
    let value: any = dataset[i].splice(0, 1);
    answers.push([...Array(10)].map((x, i) => (value[0] == i ? 1 : 0)));
  }

  for (let i = 0; i < dataset.length; i++) {
    for (let o in dataset[i]) {
      dataset[i][o] = dataset[i][o] / 255 / 10;
    }

    if (i !== dataset.length - 1 && dataset[i].length !== dataset[i + 1].length) {
      console.log(i + 1);
    }
  }
  fs.readFile(filePath2, "utf8", (err: any, dataTest: any) => {
    if (err) {
      console.error(err);
      return;
    }

    let rowsTest = dataTest.split("\n");
    let datasetTest: any = rowsTest.map((row: any) => row.split(","));
    let answersTest: any = [];

    let tempDatasetTest: Array<Array<number>> = [];
    for (let o in datasetTest) {
      if (+datasetTest[o][0] <= 9) {
        tempDatasetTest.push(datasetTest[o]);
      }
    }
    datasetTest = tempDatasetTest;

    for (let i in datasetTest) {
      let value: any = datasetTest[i].splice(0, 1);
      answersTest.push([...Array(10)].map((x, i) => (value[0] == i ? 1 : 0)));
    }

    for (let i = 0; i < datasetTest.length; i++) {
      for (let o in datasetTest[i]) {
        datasetTest[i][o] = datasetTest[i][o] / 255 / 10;
      }

      if (i !== datasetTest.length - 1 && datasetTest[i].length !== datasetTest[i + 1].length) {
        console.log(i + 1);
      }
    }

    let neuralInstance = new NeuralNetworkClass([dataset[0].length, 35, 20, answers[0].length], {
      ["paramInit"]: "random",
      ["activationFunc"]: "Sigmoid",
      ["lastActivationFunc"]: "Sigmoid",
      ["parameters"]: null,
    });
    neuralInstance.backwardProp(dataset, answers, datasetTest, answersTest, 0.8, 10, false, 4);
  });
});

//Costum dataset
// let { dataset, answers } = datasetGenerator(10000, 700)

// let neuralInstance = new NeuralNetworkClass([dataset[0].length, 10, 12, answers[0].length], {
//     ["paramInit"]: "random", ["activationFunc"]: "ReLU", ["lastActivationFunc"]: "Sigmoid",
//     ["parameters"]: null // { ["weights"]: [[[-1, 0.2, -1]], [[1], [1]]], ["bias"]: [[1], [1, 2]] }
// })

// neuralInstance.backwardProp(dataset, answers, 0.02, 0.01, 500, false, 1)

// function datasetGenerator(amount: number, firstLayerSize: number) {
//     let dataset: Array<Array<number>> = []
//     let answers: Array<Array<number>> = []
//     for (let i = 0; i < amount; i++) {
//         dataset.push([...Array(firstLayerSize)].map(() => (Math.random() + 0.01) / 10))
//     }
//     dataset.map((x, i) => {
//         // answers.push([dataset[i].reduce((a: number, b: number) => a + b) / dataset[i].length, dataset[i][0] == 1 ? 1 : 0, dataset[i][0] == 1 ? 0 : 1, dataset[i][0] == 1 ? 0 : 1, dataset[i][0] == 1 ? 0 : 1]) //, dataset[i][dataset[i].length - 1]
//         answers.push([dataset[i][0] >= 0.5 && dataset[i][1] >= 0.5 ? 1 : 0, dataset[i][0] >= 0.5 && dataset[i][1] >= 0.5 ? 0 : 1, dataset[i][0] >= 0.5 && dataset[i][1] >= 0.5 ? 0 : 1, dataset[i][0] >= 0.5 && dataset[i][1] >= 0.5 ? 0 : 1]) //, dataset[i][dataset[i].length - 1]

//     })
//     return { dataset, answers }
// }

// 2 -> dersired: [0, 0, 1] neural: [0.5 , 0.5 , 0.5]

/* Unit Testing */
// console.log(NeuralNetworkClass.prototype.randomizeDataset([[1, 0, 1], [1, 0, 1], [2, 0, 1], [1, 2, 1]], [[1, 1], [1, 0], [2, 1], [2, 2]]))
// console.log(NeuralNetworkClass.prototype.vectorMinus([1, 0, 3], [1, 2, 3]))
// console.log(neuralInstance.avgGradients([[[[1, 2], [1, 2], [1, 0]], [[1, 2, 3], [1, 2, 3]]], [[[1, 1], [1, 1], [1, 1]], [[1, 2, 5], [3, 2, 3]]], [[[1, 1], [1, 1], [1, 1]], [[1, 2, 5], [3, 2, 3]]]], [[[1, 2, 3], [1, 2]], [[1, 5, 3], [1, 0]], [[1, 5, 3], [1, 0]]]))
// console.log(neuralInstance.forwardProp([[1, 0, 1], [1, 0, 1]], [[1, 1], [1, 0]]))
