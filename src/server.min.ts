import express from "express";

const app = express();
app.get("/", (_, res) => res.send("OK"));

const PORT = process.env.PORT || 7712;
app.listen(PORT, () => console.log(`Minimal server listening on ${PORT}`));
