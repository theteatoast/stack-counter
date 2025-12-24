import { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getAddress } from './wallet';
import { incrementCounter, getCounter, getExplorerUrl } from './counter';

type TxStatus = 'idle' | 'pending' | 'success' | 'cancelled';

function App() {
    const [connected, setConnected] = useState(isConnected());
    const [address, setAddress] = useState<string | null>(getAddress());
    const [counter, setCounter] = useState<number | null>(null);
    const [txStatus, setTxStatus] = useState<TxStatus>('idle');
    const [txId, setTxId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected) {
            fetchCounter();
        }
    }, [connected]);

    // Auto-refresh counter every 30 seconds when transaction is pending/success
    useEffect(() => {
        if (connected && (txStatus === 'success' || txStatus === 'pending')) {
            const interval = setInterval(fetchCounter, 30000);
            return () => clearInterval(interval);
        }
    }, [connected, txStatus]);

    const fetchCounter = async () => {
        try {
            const value = await getCounter();
            setCounter(value);
        } catch (error) {
            console.error('Failed to fetch counter:', error);
        }
    };

    const handleConnect = () => {
        connect(() => {
            setConnected(true);
            setAddress(getAddress());
        });
    };

    const handleDisconnect = () => {
        disconnect();
        setConnected(false);
        setAddress(null);
        setCounter(null);
        setTxStatus('idle');
        setTxId(null);
    };

    const handleIncrement = async () => {
        setLoading(true);
        setTxStatus('pending');

        await incrementCounter(
            (txId) => {
                setTxId(txId);
                setTxStatus('success');
                setLoading(false);
                // Refresh counter after a short delay
                setTimeout(fetchCounter, 3000);
            },
            () => {
                setTxStatus('cancelled');
                setLoading(false);
            }
        );
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="logo-display">🔢</div>
                <h1 className="title">StackCounter</h1>
                <p className="subtitle">
                    A minimal dApp demonstrating WalletKit SDK usage on Stacks mainnet
                </p>
            </header>

            {/* Wallet Card */}
            <div className="card">
                <div className="card-title">Wallet Connection</div>
                {connected && address ? (
                    <>
                        <div className="wallet-address-box">{address}</div>
                        <button
                            className="btn btn-text"
                            onClick={handleDisconnect}
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={handleConnect}
                    >
                        <span>🔗</span> Connect Wallet
                    </button>
                )}
            </div>

            {/* Counter Card */}
            <div className="card">
                <div className="card-title">Onchain Counter</div>
                {connected ? (
                    <>
                        <div className="counter-wrapper">
                            <span className="counter-value">
                                {counter !== null ? counter : '—'}
                            </span>
                            <span className="counter-label">Current Count</span>
                            <button
                                onClick={fetchCounter}
                                className="btn btn-sm btn-secondary"
                                style={{ marginTop: '16px' }}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '20px' }}
                            onClick={handleIncrement}
                            disabled={loading}
                        >
                            {loading ? '⏳ Waiting for signature...' : '➕ Increment Counter'}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        Connect your wallet to interact with the counter
                    </div>
                )}
            </div>

            {/* Transaction Status Card */}
            {txStatus !== 'idle' && (
                <div className={`card status-card ${txStatus === 'success' ? 'success' : txStatus === 'cancelled' ? 'error' : ''}`}>
                    <div className="card-title">Transaction Status</div>
                    {txStatus === 'pending' && (
                        <div className="status-content">
                            <p className="status-text" style={{ color: '#ffd700' }}>
                                ⏳ Please sign the transaction in your wallet...
                            </p>
                        </div>
                    )}
                    {txStatus === 'success' && txId && (
                        <div className="status-content">
                            <p className="status-text" style={{ color: '#2ecc71' }}>
                                ✅ Transaction submitted!
                            </p>
                            <p className="status-sub">
                                Mainnet transactions may take 10-30 min to confirm. The counter will update automatically.
                            </p>
                            <a
                                href={getExplorerUrl(txId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-link"
                            >
                                View on Explorer →
                            </a>
                        </div>
                    )}
                    {txStatus === 'cancelled' && (
                        <div className="status-content">
                            <p className="status-text" style={{ color: '#ff6b6b' }}>
                                ❌ Transaction was cancelled
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                Contract:{' '}
                <a
                    href="https://explorer.stacks.co/address/SP7EGRZWRGBDHWDMJAYER4D40JM8XZCEX14M4ATQ.counter-contract-v2?chain=mainnet"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    counter-contract-v2
                </a>
            </footer>
        </div>
    );
}

export default App;
