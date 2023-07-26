
class NeuralNetwork {
  constructor(arrOfHiddenLayers, inputData, outputData) {
    this.error;
    this.outputData = outputData //Must be 2d-array
    this.inputData = inputData //Must be 2d-array
    this.arrOfInputAndHiddenLayers = [inputData[0].length].concat(...arrOfHiddenLayers);
    this.layers = [];
    this.learningRate = 0.1 * 0.1;
    this.weights = [];
    this.bias = [];
    this.arrOfNeuronValues = []
    this.results = { neuralOuput: [], expectedOutput: [] }
    this.specificOutput = []
    this.init();
  }
  init() {
    this.arrOfInputAndHiddenLayers.map((x) => this.layers.push(x));
    [this.outputData[0].length].map((x) => this.layers.push(x));

    //Weights
    for (let i = 0; i < this.arrOfInputAndHiddenLayers.length; i++) {
      this.weights.push([]);
      for (let k = 0; k < this.layers[+i + 1]; k++) {
        this.weights[i].push(
          Array.apply(null, Array(this.layers[i])).map(function () {
            return Math.random() * 2 - 1;
          })
        );
      }
    }

    //Bias for all recieving neurons
    for (let i in this.arrOfInputAndHiddenLayers) {
      this.bias.push(
        Array.apply(null, Array(this.layers[+i + 1])).map(function () {
          return Math.random() * 2 - 1;
        })
      );
    }

    this.forwardProp()

  }
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  sigmoidDerivative(x) {
    return this.sigmoid(x) * (1 - this.sigmoid(x));
  }
  ReLU(x) {
    return x > 0 ? x : 0;
  }
  ReLUDerivative(x) {
    return x > 0 ? 1 : 0;
  }

  dotProduct(vector1, vector2) {
    let result = vector1.map((x, i) => x * vector2[i])
    result = result.reduce((a, b) => a + b)
    return result
  }

  forwardProp() {
    this.errorTogether = []
    let counter = 0
    this.allErrors = [];
    for (let o in this.inputData) {
      //Splitting in datasets
      this.arrOfNeuronValues = []
      this.specificOutput = []
      this.arrOfZNeurons = []
      this.arrOfNeuronValues.push(this.inputData[o])
      this.specificOutput = this.outputData[o]
      for (let i = 1; i < this.layers.length; i++) {
        //Splitting in layers
        let layerNeurons = []
        let layerZNeurons = []
        for (let k = 0; k < this.layers[i]; k++) {
          //Splitting in neurons
          let neuronZ = this.dotProduct(this.arrOfNeuronValues[+i - 1], this.weights[+i - 1][k]) + this.bias[+i - 1][k]
          let neuronA;
          if (i == this.layers.length - 1) neuronA = this.sigmoid(neuronZ)
          else neuronA = this.ReLU(neuronZ)
          layerNeurons.push(neuronA)
          layerZNeurons.push(neuronZ)
        }
        this.arrOfNeuronValues.push(layerNeurons)
        this.arrOfZNeurons.push(layerZNeurons)


      }
      this.results.expectedOutput.push(this.specificOutput)
      this.results.neuralOuput.push(this.arrOfNeuronValues[+this.arrOfNeuronValues.length - 1])
      if (o < this.inputData.length * (1 - (30 / trainingAmount))) {
        this.backwardProp()

      }




      else {
        this.backwardProp()
        this.arrOfNeuronValues[+this.arrOfNeuronValues.length - 1].map((x, i) => this.allErrors.push((x - this.specificOutput[i]) ** 2))

        this.errorTogether.push(this.error)

        if (counter % 1 == 0) {
          let average = this.allErrors.reduce((a, b) => a + b) / this.allErrors.length
          counter++
          console.log(average)
        }

      }



    }
  }

  backwardProp() {
    this.error = 0;
    this.arrOfNeuronValues[+this.arrOfNeuronValues.length - 1].map((x, i) => this.error += (x - this.specificOutput[i]) ** 2)
    this.aGradient = []
    this.debugger = []
    for (let i = +this.arrOfNeuronValues.length - 1; i >= 0; i--) {
      this.aGradient.unshift([])
      for (let k = +this.arrOfNeuronValues[i].length - 1; k >= 0; k--) {
        if (i == +this.arrOfNeuronValues.length - 1) {
          this.aGradient[0].unshift((+this.arrOfNeuronValues[i][k] - (+this.specificOutput[k])) * 2)
        } else {
          this.tempAGradient = []
          if (i == +this.arrOfNeuronValues.length - 2) {
            this.arrOfNeuronValues[+i + 1].map((x, index) => {
              this.tempAGradient.unshift(this.weights[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index][k] *
                this.sigmoidDerivative(+this.arrOfZNeurons[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index]) *
                this.aGradient[1][+this.arrOfNeuronValues[+i + 1].length - 1 - index])
              this.debugger.unshift([
                this.sigmoidDerivative(+this.arrOfZNeurons[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index]), this.arrOfZNeurons[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index],
                this.arrOfZNeurons
              ])
            })
          } else {
            this.arrOfNeuronValues[+i + 1].map((x, index) => this.tempAGradient.unshift(+this.weights[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index][k] *
              this.ReLUDerivative(+this.arrOfZNeurons[+i][+this.arrOfNeuronValues[+i + 1].length - 1 - index]) *
              +this.aGradient[1][+this.arrOfNeuronValues[+i + 1].length - 1 - index]))
          }
          this.aGradient[0].unshift(this.tempAGradient.reduce((a, b) => +a + +b))
        }
      }
    }


    this.biasGradient = [];
    this.weightGradient = [];
    for (let i = +this.arrOfNeuronValues.length - 1; i > 0; i--) {
      let tempBiasGradient = []
      let tempWeightGradient = []
      for (let k in this.arrOfNeuronValues[i]) {
        tempWeightGradient.unshift([])
        if (i == +this.arrOfNeuronValues.length - 1) {
          tempBiasGradient.push(1 * +this.sigmoidDerivative(+this.arrOfZNeurons[+i - 1][k]) * +this.aGradient[+i][k])
          this.arrOfNeuronValues[i - 1].map((x, o) => {
            tempWeightGradient[0].push(+this.arrOfNeuronValues[i - 1][o] * +this.sigmoidDerivative(this.arrOfZNeurons[+i - 1][k]) * +this.aGradient[+i][k])
          })
        } else {
          tempBiasGradient.push(1 * +this.ReLUDerivative(+this.arrOfZNeurons[+i - 1][k]) * +this.aGradient[+i][k])
          this.arrOfNeuronValues[i - 1].map((x, o) => {
            tempWeightGradient[0].push(+this.arrOfNeuronValues[i - 1][o] * +this.ReLUDerivative(this.arrOfZNeurons[+i - 1][k]) * +this.aGradient[+i][k])
          })
        }

      }
      this.biasGradient.unshift(tempBiasGradient)
      this.weightGradient.unshift(tempWeightGradient)
    }
    this.weightGradient.map(((x, a) => x.map((y, b) => y.map((z, c) => this.weights[a][b][c] -= z * this.learningRate))))
    this.biasGradient.map((x, a) => x.map((y, b) => this.bias[a][b] -= y * this.learningRate))

  }
}

var trainingAmount = 30000

let { inputArr, outputArr } = dataSetGenerator()
console.log(inputArr)
console.log(outputArr)
let nn = new NeuralNetwork([10, 20, 30, 9, 8, 4], inputArr, outputArr);

function dataSetGenerator2() {
  let inputArr = [], outputArr = []
  for (let i = 0; i < trainingAmount; i++) {
    inputArr.push(Array.apply(null, Array(8)).map(function () {
      return Math.floor(Math.random() * (2))
    }))
  }
  inputArr.map(x => {
    if (x[0] == 1) outputArr.push([1])
    else outputArr.push([0])
  })
  return { inputArr: inputArr, outputArr: outputArr }
}

function dataSetGenerator() {
  let inputArr = [], outputArr = [], max = 2, min = 1
  for (let i = 0; i < trainingAmount; i++) {
    inputArr.push(Array.apply(null, Array(1)).map(function () {
      return Math.floor(Math.random() * (max - min)) + min
    }))
  }
  inputArr.map(x => {
    if (x.reduce((a, b) => a + b) % 2 == 0) outputArr.push([1])
    else outputArr.push([0])
  })
  return { inputArr: inputArr, outputArr: outputArr }
}



