const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;


const windowSize = 10;
let window = [];

const allowedIDs = ['p', 'f', 'e', 'r'];

app.get("/numbers/:numberid", async (req, res) => {
    const { numberid } = req.params;
    console.log(numberid)

    if (!allowedIDs.includes(numberid)) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    const windowPrevState = [...window];
    let numbers = [];

    try {
        const source = axios.CancelToken.source();
        setTimeout(() => {
            source.cancel("Timeout");
        }, 500); 
        const response = await axios.get(`http://20.244.56.144/testserver/numbers/${numberid}`, {
            cancelToken: source.token
        });

        numbers = response.data.numbers || [];

        numbers.forEach(num => {
            if (!window.includes(num)) {
                if (window.length >= windowSize) {
                    window.shift(); 
                }
                window.push(num); 
            }
        });

    } catch (error) {
        console.log("API failed or timed out:", error.message);
    }

    const average = (window.reduce((sum, num) => sum + num, 0) / (window.length || 1)).toFixed(2);

    res.json({
        windowPrevState,
        windowCurrState: window,
        numbers,
        avg: parseFloat(average)
    });
});

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
