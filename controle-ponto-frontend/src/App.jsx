import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registros, setRegistros] = useState([]);
  const [ajustes, setAjustes] = useState([]);
  const [tipo, setTipo] = useState('entrada');
  const [justificativa, setJustificativa] = useState('');
  const [dataSolicitada, setDataSolicitada] = useState('');
  const [espelho, setEspelho] = useState([]);
  const [mesEspelho, setMesEspelho] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async () => {
    const res = await axios.post(`${API_BASE}/login/`, { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    const userRes = await axios.get(`${API_BASE}/users/me/`, {
      headers: { Authorization: `Token ${res.data.token}` },
    });
    setIsAdmin(userRes.data.is_admin);
  };

  const registrarPonto = async () => {
    await axios.post(`${API_BASE}/registros/`, { tipo }, {
      headers: { Authorization: `Token ${token}` },
    });
    carregarRegistros();
  };

  const solicitarAjuste = async () => {
    await axios.post(`${API_BASE}/ajustes/`, { data_solicitada: dataSolicitada, justificativa }, {
      headers: { Authorization: `Token ${token}` },
    });
    carregarAjustes();
  };

  const aprovarAjuste = async (id) => {
    await axios.patch(`${API_BASE}/ajustes/${id}/`, { aprovado: true }, {
      headers: { Authorization: `Token ${token}` },
    });
    carregarAjustes();
  };

  const confirmarPonto = async (id) => {
    await axios.post(`${API_BASE}/registros/${id}/confirmar/`, {}, {
      headers: { Authorization: `Token ${token}` },
    });
    carregarRegistros();
  };

  const carregarRegistros = async () => {
    const res = await axios.get(`${API_BASE}/registros/`, {
      headers: { Authorization: `Token ${token}` },
    });
    setRegistros(res.data);
  };

  const carregarAjustes = async () => {
    const res = await axios.get(`${API_BASE}/ajustes/`, {
      headers: { Authorization: `Token ${token}` },
    });
    setAjustes(res.data);
  };

  const carregarEspelho = async () => {
    const res = await axios.get(`${API_BASE}/registros/espelho/?mes=${mesEspelho}`, {
      headers: { Authorization: `Token ${token}` },
    });
    setEspelho(res.data);
  };

  useEffect(() => {
    if (token) {
      carregarRegistros();
      carregarAjustes();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input type="text" className="border w-full mb-2" placeholder="Usuário" onChange={e => setUsername(e.target.value)} />
        <input type="password" className="border w-full mb-2" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Controle de Ponto</h1>

      <div>
        <h2 className="font-semibold">Registrar Ponto</h2>
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="border mr-2">
          <option value="entrada">Entrada</option>
          <option value="intervalo">Intervalo</option>
          <option value="retorno">Retorno</option>
          <option value="saida">Saída</option>
        </select>
        <button className="bg-green-500 text-white px-4 py-1" onClick={registrarPonto}>Registrar</button>
      </div>

      <div>
        <h2 className="font-semibold">Solicitar Ajuste</h2>
        <input type="date" className="border mr-2" value={dataSolicitada} onChange={e => setDataSolicitada(e.target.value)} />
        <input type="text" className="border mr-2" placeholder="Justificativa" value={justificativa} onChange={e => setJustificativa(e.target.value)} />
        <button className="bg-yellow-500 text-white px-4 py-1" onClick={solicitarAjuste}>Enviar</button>
      </div>

      <div>
        <h2 className="font-semibold">Espelho de Ponto</h2>
        <input type="month" className="border mr-2" value={mesEspelho} onChange={e => setMesEspelho(e.target.value)} />
        <button className="bg-indigo-500 text-white px-4 py-1" onClick={carregarEspelho}>Consultar</button>
        <ul className="mt-2 space-y-1">
          {espelho.map(e => (
            <li key={e.id} className="border p-2 rounded text-sm">
              <strong>{e.tipo}</strong> - {new Date(e.data_hora).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Ajustes Solicitados</h2>
        <ul className="space-y-1">
          {ajustes.map(aj => (
            <li key={aj.id} className="border p-2 text-sm rounded flex justify-between items-center">
              <span>{aj.data_solicitada} - {aj.justificativa}</span>
              <span className={aj.aprovado ? 'text-green-600' : 'text-red-600'}>{aj.aprovado ? 'Aprovado' : 'Pendente'}</span>
              {isAdmin && !aj.aprovado && (
                <button className="ml-2 text-sm bg-blue-500 text-white px-2 py-1" onClick={() => aprovarAjuste(aj.id)}>Aprovar</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div>
          <h2 className="font-semibold">Confirmar Pontos</h2>
          <ul className="space-y-1">
            {registros.map(r => (
              <li key={r.id} className="border p-2 text-sm rounded flex justify-between items-center">
                <span>{r.user} - {r.tipo} - {new Date(r.data_hora).toLocaleString()}</span>
                {!r.confirmado && (
                  <button className="ml-2 text-sm bg-green-600 text-white px-2 py-1" onClick={() => confirmarPonto(r.id)}>Confirmar</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
