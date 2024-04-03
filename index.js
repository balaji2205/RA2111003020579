const express = require("express");
const axios = require("axios");
const { isPrime, isFibonacci } = require("./helpers");
const app = express();
const PORT = 9876;

const windowSize = 10;
let storedNumbers = [];

app.use(express.json());

const calculateAverage = (numbers) => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  let numbers = [];

  try {
    const response = await axios.get(
      `https://localhost:9876/numbers/e${numberid}`
    );
    numbers = response.data.filter(
      (num, index) => response.data.indexOf(num) === index
    );

    if (numberid === "p") {
      numbers = numbers.filter(isPrime);
    } else if (numberid === "f") {
      numbers = numbers.filter(isFibonacci);
    }

    if (storedNumbers.length < windowSize) {
      storedNumbers.push(...numbers);
    } else {
      storedNumbers = storedNumbers.slice(numbers.length - windowSize);
      storedNumbers.push(...numbers);
    }

    // Calculate average of stored numbers
    const avg = calculateAverage(storedNumbers);

    // Prepare response
    const responseObj = {
      windowPrevState: storedNumbers.slice(
        0,
        storedNumbers.length - numbers.length
      ),
      windowCurrState: storedNumbers,
      numbers,
      avg,
    };

    res.json(responseObj);
  } catch (error) {
    console.error("Error fetching numbers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
