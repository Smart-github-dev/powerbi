const express = require("express");
const path = require("path");
const axios = require("axios");
const authController = require("../controllers/authController");
const fs = require("fs");
const router = express.Router();

// authentication routes
router.get("/auth/login", authController.loginUser);
router.post("/redirect", authController.handleRedirectWithCode);
router.get("/auth/logout", authController.logoutUser);

router.post("/exportTo", async (req, res) => {
  try {
    const { reportId, accessToken, format } = req.body;
    const response = await axios({
      method: "GET",
      url: `https://api.powerbi.com/v1.0/myorg/reports/${reportId}/Export`,
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const writer = fs.createWriteStream("report.zip");
    response.data.pipe(writer);
    writer.on("finish", () => {
      res.download("report.zip", "report.zip", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      });
    });
    writer.on("error", () => {
      res.send({ success: false });
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/exportTofile", async (req, res) => {
  try {
    const { reportId, accessToken, format } = req.body;
    const response = await axios({
      method: "POST",
      url: `https://api.powerbi.com/v1.0/myorg/reports/${reportId}/ExportTo`,
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        format: format,
      },
    });
    const writer = fs.createWriteStream(`report.${format}`);
    response.data.pipe(writer);
    writer.on("finish", () => {
      res.send({ success: true });
    });
    writer.on("error", () => {
      res.send({ success: false });
    });
  } catch (error) {
    res.send(error);
  }
});

// fetches the SPA authorization code if the user is authenticated
router.get("/auth/fetchCode", authController.sendSPACode);

router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
