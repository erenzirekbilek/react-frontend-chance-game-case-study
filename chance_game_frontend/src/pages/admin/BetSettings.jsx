import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Badge
} from 'react-bootstrap';
import AdminNavbar from '../../components/layout/admin/AdminNavbar';

function BetSettings() {
  const [betLevels, setBetLevels] = useState([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [currentLevel, setCurrentLevel] = useState({
    level_name: '',
    min_bet: 10,
    max_bet: 100,
    bet_step: 10,
    required_balance: 30
  });

  const GAME_API = 'http://127.0.0.1:8000/api/games';
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  /* ===================== FETCH ===================== */
  const fetchBetLevels = useCallback(async () => {
    try {
      const res = await axios.get(`${GAME_API}/bet-levels/`, getAuthHeader());
      setBetLevels(res.data);
    } catch (err) {
      console.error('Bet levels alınamadı:', err);
    }
  }, []);

  useEffect(() => {
    fetchBetLevels();
  }, [fetchBetLevels]);

  /* ===================== DUPLICATE CHECK ===================== */
  const isDuplicateLevel = () => {
    return betLevels.some(level => {
      // edit modunda kendisini karşılaştırma
      if (currentLevel.id && level.id === currentLevel.id) return false;

      const sameName =
        level.level_name.trim().toLowerCase() ===
        currentLevel.level_name.trim().toLowerCase();

      const sameBets =
        level.min_bet === currentLevel.min_bet &&
        level.max_bet === currentLevel.max_bet &&
        level.bet_step === currentLevel.bet_step &&
        level.required_balance === currentLevel.required_balance;

      return sameName || sameBets;
    });
  };

  /* ===================== SAVE ===================== */
  const handleSaveLevel = async () => {
    setErrorMsg('');

    const { min_bet, max_bet, required_balance, bet_step, level_name } =
      currentLevel;

    if (!level_name.trim()) {
      setErrorMsg('Lobi adı boş bırakılamaz.');
      return;
    }

    // --- İŞ KURALLARI ---
    if (max_bet > min_bet * 10) {
      setErrorMsg(
        `Girilen maksimum bahis, minimum bahsin 10 katından fazla olamaz.`
      );
      return;
    }

    if (required_balance < min_bet * 3) {
      setErrorMsg(
        `Oyuna giriş için gerekli bakiye en az ${min_bet * 3} olmalıdır.`
      );
      return;
    }

    if (Number(bet_step) !== Number(min_bet)) {
      setErrorMsg(`Bahis artış adımı minimum bahis ile aynı olmalıdır.`);
      return;
    }

    // --- DUPLICATE ---
    if (isDuplicateLevel()) {
      setErrorMsg(
        'Aynı isimde veya aynı bahis kurallarına sahip bir lobi zaten mevcut. ' +
          'Lütfen farklı bir yapılandırma deneyin.'
      );
      return;
    }

    try {
      const isUpdate = !!currentLevel.id;
      const url = isUpdate
        ? `${GAME_API}/bet-levels/${currentLevel.id}/`
        : `${GAME_API}/bet-levels/`;
      const method = isUpdate ? 'put' : 'post';

      await axios[method](url, currentLevel, getAuthHeader());
      setShowLevelModal(false);
      fetchBetLevels();
      alert('Ayarlar başarıyla kaydedildi.');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          'İşlem gerçekleştirilemedi. Lütfen kuralları kontrol edin.'
      );
    }
  };

  /* ===================== DELETE ===================== */
  const handleDelete = async id => {
    if (!window.confirm('Bu lobi ayarını silmek istediğinize emin misiniz?'))
      return;

    try {
      await axios.delete(`${GAME_API}/bet-levels/${id}/`, getAuthHeader());
      fetchBetLevels();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="d-flex">
      <AdminNavbar />

      <div
        style={{
          marginLeft: '250px',
          width: '100%',
          padding: '30px',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Container fluid>
          <div className="d-flex justify-content-between mb-4">
            <h2 className="fw-bold">⚙️ Lobi ve Bahis Ayarları</h2>
            <Button
              variant="dark"
              onClick={() => {
                setCurrentLevel({
                  level_name: '',
                  min_bet: 10,
                  max_bet: 100,
                  bet_step: 10,
                  required_balance: 30
                });
                setErrorMsg('');
                setShowLevelModal(true);
              }}
            >
              + Yeni Lobi
            </Button>
          </div>

          <Card className="shadow-sm rounded-4">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>LOBİ</th>
                  <th>MİN</th>
                  <th>MAX</th>
                  <th>STEP</th>
                  <th>GİRİŞ</th>
                  <th className="text-center">İŞLEM</th>
                </tr>
              </thead>
              <tbody>
                {betLevels.map(level => (
                  <tr key={level.id}>
                    <td className="fw-bold">{level.level_name}</td>
                    <td>{level.min_bet}</td>
                    <td>{level.max_bet}</td>
                    <td>{level.bet_step}</td>
                    <td>
                      <Badge bg="info">{level.required_balance}</Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => {
                          setCurrentLevel(level);
                          setErrorMsg('');
                          setShowLevelModal(true);
                        }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(level.id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Container>
      </div>

      {/* MODAL */}
      <Modal
        show={showLevelModal}
        onHide={() => setShowLevelModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Lobi Yapılandırması</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lobi Adı</Form.Label>
              <Form.Control
                value={currentLevel.level_name}
                onChange={e =>
                  setCurrentLevel({
                    ...currentLevel,
                    level_name: e.target.value
                  })
                }
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Label>Min Bahis</Form.Label>
                <Form.Control
                  type="number"
                  value={currentLevel.min_bet}
                  onChange={e => {
                    const v = parseInt(e.target.value) || 0;
                    setCurrentLevel({
                      ...currentLevel,
                      min_bet: v,
                      bet_step: v
                    });
                  }}
                />
              </Col>
              <Col>
                <Form.Label>Max Bahis</Form.Label>
                <Form.Control
                  type="number"
                  value={currentLevel.max_bet}
                  onChange={e =>
                    setCurrentLevel({
                      ...currentLevel,
                      max_bet: parseInt(e.target.value) || 0
                    })
                  }
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <Form.Label>Step</Form.Label>
                <Form.Control value={currentLevel.bet_step} readOnly />
              </Col>
              <Col>
                <Form.Label>Giriş Şartı</Form.Label>
                <Form.Control
                  type="number"
                  value={currentLevel.required_balance}
                  onChange={e =>
                    setCurrentLevel({
                      ...currentLevel,
                      required_balance: parseInt(e.target.value) || 0
                    })
                  }
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="w-100 fw-bold"
            onClick={handleSaveLevel}
          >
            KAYDET
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BetSettings;
