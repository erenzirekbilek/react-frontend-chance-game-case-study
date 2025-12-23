import React, { useState, useEffect } from "react";
import axios from "axios";
import GamePanel from "./GamePanel";
import { Container, Spinner, Alert } from "react-bootstrap";

const API_BASE = "http://127.0.0.1:8000/api/games";

function GameRoomContainer() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Bahis seviyeleri ve Odaları aynı anda çek
        const [betRes, roomRes] = await Promise.all([
          axios.get(`${API_BASE}/bet-levels/`, getAuthConfig()),
          axios.get(`${API_BASE}/rooms/`, getAuthConfig()),
        ]);

        setRooms(roomRes.data);
        setError(null);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Veriler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Yükleniyor...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          ⚠️ {error}
        </Alert>
      </Container>
    );
  }

  return <GamePanel rooms={rooms} setRooms={setRooms} />;
}

export default GameRoomContainer;