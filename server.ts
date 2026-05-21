import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: 요금 계산 로직
  app.post("/api/calculate-price", (req, res) => {
    const { entryDate, exitDate, vehicleType } = req.body;
    
    if (!entryDate || !exitDate) {
      return res.status(400).json({ error: "입차 및 출차 날짜가 필요합니다." });
    }

    const start = new Date(entryDate);
    const end = new Date(exitDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return res.status(400).json({ error: "출차일은 입차일보다 늦어야 합니다." });
    }

    // 기본 요금 로직 (실내 주차 기준)
    // 4일 평일 기본 50,000원, 이후 하루당 10,000원 추가 (예시)
    let totalPrice = 0;
    const baseDays = 4;
    const basePrice = 50000;
    const extraDayPrice = 10000;

    if (diffDays <= baseDays) {
      totalPrice = basePrice;
    } else {
      totalPrice = basePrice + (diffDays - baseDays) * extraDayPrice;
    }

    res.json({ 
      days: diffDays, 
      totalPrice,
      basePrice,
      extraDayPrice
    });
  });

  // API: 예약 접수
  app.post("/api/reserve", (req, res) => {
    const reservationData = req.body;
    console.log("New Reservation:", reservationData);
    // 실제 환경에서는 DB 저장 및 SMS 발송 로직 추가
    res.json({ success: true, message: "예약이 완료되었습니다." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
