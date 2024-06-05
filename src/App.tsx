import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectLightStatus, setLightStatus } from './features/status/statusSlice';
import axios from 'axios';

interface Network {
  name: string;
  ip: string;
}

const App: React.FC = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [newNetworkName, setNewNetworkName] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const lightStatus = useAppSelector(selectLightStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedNetworks = JSON.parse(localStorage.getItem('networks') || '[]');
    setNetworks(savedNetworks);

    const fetchIpAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };

    fetchIpAddress();
  }, []);

  const saveNetwork = () => {
    if (!newNetworkName || !ipAddress) {
      alert('Будь ласка, введіть назву мережі та IP-адресу.');
      return;
    }

    const newNetwork = { name: newNetworkName, ip: ipAddress };
    const updatedNetworks = [...networks, newNetwork];
    setNetworks(updatedNetworks);
    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    setNewNetworkName('');
    setIpAddress('');
  };

  const checkStatus = async () => {
    setChecking(true);
    const ip = selectedNetwork || ipAddress;

    if (!ip) {
      alert('Будь ласка, виберіть мережу або введіть IP-адресу.');
      setChecking(false);
      return;
    }

    try {
      console.log(`Checking status for IP address: ${ip}`);
      const response = await axios.get(`http://localhost:5000/ping?ip=${ip}`);
      console.log('Response from server:', response.data);
      dispatch(setLightStatus(response.data.status));
    } catch (error: any) {
      console.error('Error fetching status:', error);
      dispatch(setLightStatus('Error checking the status.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Перевірка світла</h1>
      <div className="mb-6">
        <label className="mr-2">Виберіть збережену мережу:</label>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="">Виберіть мережу</option>
          {networks.map((network, index) => (
            <option key={index} value={network.ip}>
              {network.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <input
          type="text"
          value={newNetworkName}
          onChange={(e) => setNewNetworkName(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Назва мережі"
        />
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          className="border p-2 mr-2"
          placeholder="IP-адреса роутера"
        />
        <button onClick={saveNetwork} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Зберегти
        </button>
      </div>
      <button
        onClick={checkStatus}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${checking ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={checking}
      >
        {checking ? 'Перевіряється...' : 'Перевірити'}
      </button>
      <h2
        className={`text-lg mt-4 p-4 rounded transition-all duration-500 ease-in-out ${
          lightStatus === 'є світло' ? 'bg-green-500 bg-opacity-50' : lightStatus === 'немає світла' ? 'bg-red-500 bg-opacity-50' : ''
        }`}
      >
        Статус світла: <span>{lightStatus ?? 'Немає даних'}</span>
      </h2>
    </div>
  );
};

export default App;
