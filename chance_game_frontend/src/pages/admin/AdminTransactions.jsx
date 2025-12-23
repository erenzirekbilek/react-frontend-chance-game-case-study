import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async (query = '') => {
        try {
            const token = localStorage.getItem('access'); // JWT Token
            if (!token) {
            console.error("Token bulunamadı!");
            return;
            }
            const response = await axios.get(`http://127.0.0.1:8000/api/users/transactions/?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Veri çekilirken hata oluştu:", error);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        fetchTransactions(e.target.value);
    };

    return (
        <div className="admin-container">
            <h2>Hesap Hareketleri Geçmişi</h2>
            
            <input 
                type="text" 
                placeholder="Kullanıcı ara..." 
                value={search}
                onChange={handleSearch}
                style={{ padding: '8px', marginBottom: '15px', width: '300px' }}
            />

            <table className="transaction-table" border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Kullanıcı</th>
                        <th>Tür</th>
                        <th>Miktar</th>
                        <th>Eski Bakiye</th>
                        <th>Yeni Bakiye</th>
                        <th>Tarih</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <td>{t.username}</td>
                            <td><strong>{t.transaction_type.toUpperCase()}</strong></td>
                            <td style={{ color: t.amount > 0 ? 'green' : 'red' }}>
                                {t.amount > 0 ? `+${t.amount}` : t.amount}
                            </td>
                            <td>{t.old_balance}</td>
                            <td>{t.new_balance}</td>
                            <td>{new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTransactions;