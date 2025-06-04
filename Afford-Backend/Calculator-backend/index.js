const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const NUMBER_TYPES = {
  'p': 'primes',
  'f': 'fibo',
  'e': 'even',
  'r': 'rand'
};

let numberWindow = [];
let previousWindowState = [];

const isUnique = (num, arr) => !arr.includes(num);
const calculateAverage = (nums) => nums.reduce((a, b) => a + b, 0) / nums.length;

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(
      `http://20.244.56.144/evaluation-service/${NUMBER_TYPES[type]}`,
      {
        timeout: TIMEOUT_MS,
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5MDIwMTU3LCJpYXQiOjE3NDkwMTk4NTcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA5Y2U3MTUxLWZhZWMtNGRiNS04YjdmLTFlMmY1MjZmMTBmNiIsInN1YiI6ImJoYWl5dXZpcmF0aG9kMTIzQGdtYWlsLmNvbSJ9LCJlbWFpbCI6ImJoYWl5dXZpcmF0aG9kMTIzQGdtYWlsLmNvbSIsIm5hbWUiOiJiaGF2ZXNoIHJhdGhvZCIsInJvbGxObyI6IjcyMzA5NjMxaCIsImFjY2Vzc0NvZGUiOiJLUmpVVVUiLCJjbGllbnRJRCI6IjA5Y2U3MTUxLWZhZWMtNGRiNS04YjdmLTFlMmY1MjZmMTBmNiIsImNsaWVudFNlY3JldCI6InpmTmdkUUdreFFqQUZGd3EifQ.8bh_8a3t_RNSlrUtKnVNUYXyHVPWNClbhAutiL8rPxg'
        }
      }
    );
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${type} numbers:`, error.message);
    return [];
  }
};

const processNumbers = (newNumbers) => {
  previousWindowState = [...numberWindow];
  
  const uniqueNewNumbers = newNumbers.filter(n => isUnique(n, numberWindow));
  
  for (const num of uniqueNewNumbers) {
    if (numberWindow.length >= WINDOW_SIZE) {
      numberWindow.shift();
    }
    numberWindow.push(num);
  }
  
  return {
    windowPrevState: previousWindowState,
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: calculateAverage(numberWindow).toFixed(2)
  };
};

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;
  
  if (!NUMBER_TYPES[numberId]) {
    return res.status(400).json({ error: 'Invalid number type' });
  }
  
  const numbers = await fetchNumbers(numberId);
  if (numbers.length === 0) {
    return res.status(503).json({ error: 'Failed to fetch numbers' });
  }
  
  const result = processNumbers(numbers);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});