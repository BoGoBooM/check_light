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
  const [availableNetworks, setAvailableNetworks] = useState<{ ssid: string, ip: string }[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [newNetworkName, setNewNetworkName] = useState<string>('');
  const [editingNetworkIndex, setEditingNetworkIndex] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<Network[]>([]);
  const lightStatus = useAppSelector(selectLightStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedNetworks = JSON.parse(localStorage.getItem('networks') || '[]');
    const savedHistory = JSON.parse(localStorage.getItem('connectionHistory') || '[]');
    setNetworks(savedNetworks);
    setConnectionHistory(savedHistory);

    const fetchIpAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };

    const fetchAvailableNetworks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/networks');
        setAvailableNetworks(response.data);
      } catch (error) {
        console.error('Error fetching available networks:', error);
      }
    };

    fetchIpAddress();
    fetchAvailableNetworks();
  }, []);

  const saveNetwork = () => {
    if (!newNetworkName || !ipAddress) {
      alert('Будь ласка, введіть назву мережі та IP-адресу.');
      return;
    }

    const newNetwork = { name: newNetworkName, ip: ipAddress };

    let updatedNetworks;
    if (editingNetworkIndex !== null) {
      updatedNetworks = networks.map((network, index) =>
        index === editingNetworkIndex ? newNetwork : network
      );
      setEditingNetworkIndex(null);
    } else {
      updatedNetworks = [...networks, newNetwork];
    }

    setNetworks(updatedNetworks);
    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    setNewNetworkName('');
    setIpAddress('');
    setSelectedNetwork('');
  };

  const editNetwork = (index: number) => {
    const network = networks[index];
    setNewNetworkName(network.name);
    setIpAddress(network.ip);
    setEditingNetworkIndex(index);
    setSelectedNetwork('');
  };

  const deleteNetwork = (index: number) => {
    const updatedNetworks = networks.filter((_, i) => i !== index);
    setNetworks(updatedNetworks);
    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    if (editingNetworkIndex === index) {
      setEditingNetworkIndex(null);
      setNewNetworkName('');
      setIpAddress('');
    }
  };

  const handleNetworkSelection = (ip: string) => {
    setSelectedNetwork(ip);
    const network = networks.find((n) => n.ip === ip);
    if (network) {
      setNewNetworkName(network.name);
      setIpAddress(network.ip);
      setEditingNetworkIndex(networks.indexOf(network));
    }
  };

  const handleAvailableNetworkSelection = (ip: string) => {
    setIpAddress(ip);
  };

  const addConnectionHistory = (network: Network) => {
    const updatedHistory = [network, ...connectionHistory];
    setConnectionHistory(updatedHistory);
    localStorage.setItem('connectionHistory', JSON.stringify(updatedHistory));
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
      const response = await axios.get(`http://localhost:5001/ping?ip=${ip}`);
      console.log('Response from server:', response.data);
      dispatch(setLightStatus(response.data.status));
      const network = networks.find((n) => n.ip === ip) || { name: 'Unknown', ip };
      addConnectionHistory(network);
    } catch (error: any) {
      console.error('Error fetching status:', error);
      dispatch(setLightStatus('Error checking the status.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white font-sans">
      <div className="container mx-auto p-4">
        <h1 className="text-5xl font-extrabold mb-8 shadow-md p-4 rounded bg-gray-800 border-4 border-gray-700">Перевірка світла</h1>
        <div className="mb-6">
          <label className="block mb-2">Виберіть збережену мережу:</label>
          <select
            value={selectedNetwork}
            onChange={(e) => handleNetworkSelection(e.target.value)}
            className="border-2 border-gray-700 p-2 mb-2 w-full text-black rounded focus:outline-none focus:ring-4 focus:ring-yellow-500 transition-all duration-300"
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
          <label className="block mb-2">Виберіть доступну мережу:</label>
          <select
            onChange={(e) => handleAvailableNetworkSelection(e.target.value)}
            className="border-2 border-gray-700 p-2 mb-2 w-full text-black rounded focus:outline-none focus:ring-4 focus:ring-yellow-500 transition-all duration-300"
          >
            <option value="">Виберіть мережу</option>
            {availableNetworks.map((network, index) => (
              <option key={index} value={network.ip}>
                {network.ssid} ({network.ip})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={newNetworkName}
            onChange={(e) => setNewNetworkName(e.target.value)}
            className="border-2 border-gray-700 p-2 mb-2 w-full text-black rounded focus:outline-none focus:ring-4 focus:ring-yellow-500 transition-all duration-300"
            placeholder="Назва мережі"
          />
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="border-2 border-gray-700 p-2 mb-2 w-full text-black rounded focus:outline-none focus:ring-4 focus:ring-yellow-500 transition-all duration-300"
            placeholder="IP-адреса роутера"
          />
          <button onClick={saveNetwork} className="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded w-full transition-all duration-300">
            {editingNetworkIndex !== null ? 'Оновити' : 'Зберегти'}
          </button>
        </div>
        <div className="mb-6">
          {networks.map((network, index) => (
            <div key={index} className="flex items-center mb-2 bg-gray-800 p-2 rounded shadow-md border-4 border-gray-700 transition-all duration-300 hover:bg-gray-700">
              <span className="mr-2 flex-1">{network.name} ({network.ip})</span>
              <button onClick={() => editNetwork(index)} className="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-1 px-2 rounded mr-2 transition-all duration-300">
                Редагувати
              </button>
              <button onClick={() => deleteNetwork(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition-all duration-300">
                Видалити
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={checkStatus}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition-all duration-300 ${checking ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Історія підключень</h3>
          <ul className="list-disc pl-5">
            {connectionHistory.map((network, index) => (
              <li key={index} className="mb-2">
                {network.name} ({network.ip})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
